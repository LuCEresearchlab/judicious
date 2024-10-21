import Editor, { loader } from '@monaco-editor/react';
import { debounce } from 'lodash';
import { type editor as EditorNamespace } from 'monaco-editor';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { ExecutionResponse } from '../src/codeExecution';
import { addMarkers } from '../src/pythonTraceback';
import { registerCustomPythonLanguage, STRICT_PYTHON3_LANG_ID } from '../src/strictPython3';
import theme from '../src/theme';

// Load the same version of monaco-editor specified in the package.json from a
// CDN. We add it as a dependency to get the types, but we avoid bundling it as
// it increases the load on our server, needs to be transpiled with webpack,
// makes the dev server slow).
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.50.0/min/vs' },
});

const themeName = 'customtheme';
const customTheme = {
  base: 'vs', // use vscode light as base theme
  inherit: true,
  rules: [],
  colors: {
    'editorLineNumber.foreground': '#60bcd9',
    'editorLineNumber.activeForeground': '#60bcd9',
    'editor.wordHighlightBackground': '#57575710',
  },
};

const RUN_CODE_CONDITION_KEY = 'executionAllowedCondition';
export const COLORIZE_CLASSNAME = 'monaco-colorize';

export default function CodeEditor({
  initialSource, currentSource, executionResponse = undefined, onChange = () => {},
  onExecutionRequested = undefined,
  executionAllowed = false, executionFinished = false, firstLineNumber = 1, readOnly = false,
  collapsedErrorMarkers = false, resetCounter = 0,
} :
{ initialSource: string, currentSource: string, executionResponse?: ExecutionResponse,
  onChange?: (source: string) => void, onExecutionRequested? : () => void,
  executionAllowed?: boolean, executionFinished?: boolean, firstLineNumber?: number,
  readOnly?: boolean, collapsedErrorMarkers?: boolean, resetCounter?: number }) {
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const monacoInstance = monacoRef.current;
  const editorInstance = editorRef.current;
  const [
    executionAllowedCondition,
    setExecutionAllowedCondition] = useState<EditorNamespace.IContextKey<boolean> | null>(null);

  const handleEditorMount = (
    editor: EditorNamespace.IStandaloneCodeEditor,
    monaco: any,
  ) => {
    monacoRef.current = monaco;
    editorRef.current = editor;

    registerCustomPythonLanguage(monaco);

    monaco.editor.defineTheme(themeName, customTheme);
    monaco.editor.setTheme(themeName);

    setExecutionAllowedCondition(editor.createContextKey(
      RUN_CODE_CONDITION_KEY,
      executionAllowed,
    ));

    const updateHeight = (event: EditorNamespace.IContentSizeChangedEvent) => {
      if (event.contentHeightChanged) {
        if (containerRef.current !== null) {
          containerRef.current.style.height = `${event.contentHeight}px`;
        }
        editor.layout({ width: editor.getLayoutInfo().width, height: event.contentHeight });
      }
    };
    editor.onDidContentSizeChange(updateHeight);
    // Manually trigger the first height update.
    updateHeight({
      contentHeight: editor.getContentHeight(),
      contentHeightChanged: true,
      contentWidth: editor.getContentWidth(),
      contentWidthChanged: true,
    });
  };

  const clearMarkers = useCallback(() => {
    if (monacoInstance && editorInstance) {
      // Only clear markers and close the open ones if there are any
      // (otherwise this inappropriately focuses the editor).
      if (monacoInstance.editor.getModelMarkers().length > 0) {
        monacoInstance.editor.setModelMarkers(editorInstance.getModel(), 'owner', []);
        editorInstance.trigger('', 'closeMarkersNavigation', {});
      }
    }
  }, [monacoInstance, editorInstance]);

  // Effect to update the condition that determines whether the code execution is allowed or not.
  useEffect(() => {
    if (executionAllowedCondition) {
      executionAllowedCondition.set(executionAllowed);
    }
  }, [executionAllowed, executionAllowedCondition]);

  // Effect to register the action that triggers the code execution.
  useEffect(() => {
    if (monacoInstance && editorInstance && onExecutionRequested) {
      const actionDisposer = editorInstance.addAction({
        id: 'code-execution',
        label: 'Run Code Cell',
        keybindings: [
          // eslint-disable-next-line no-bitwise
          monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
        ],
        precondition: RUN_CODE_CONDITION_KEY,
        contextMenuGroupId: 'navigation',
        run() {
          onExecutionRequested();
        },
      });
      return () => {
        actionDisposer.dispose();
      };
    }
    return () => {};
  }, [editorInstance, monacoInstance, onExecutionRequested]);

  // Effect to trigger remeasurement of fonts after they have been loaded.
  useEffect(() => {
    document.fonts.ready.then(() => {
      if (monacoInstance) {
        monacoInstance.editor.remeasureFonts();
      }
    });
  }, [monacoInstance]);

  // Effect to react to changes in the execution response.
  useEffect(
    () => {
      if (monacoInstance && editorInstance) {
        clearMarkers();
        if (executionResponse?.type === 'error' && executionFinished) {
          addMarkers(
            monacoInstance,
            editorInstance,
            executionResponse,
            firstLineNumber,
            collapsedErrorMarkers,
          );
        }
      }
    },
    [executionResponse, editorInstance, monacoInstance, clearMarkers, executionFinished,
      firstLineNumber, collapsedErrorMarkers],
  );

  // Effect to reset the editor when resetCounter changes.
  useEffect(() => {
    if (editorInstance && resetCounter > 0) {
      editorInstance.setValue(initialSource);
      clearMarkers();
    }
  }, [editorInstance, initialSource, clearMarkers, resetCounter]);

  const debouncedHandleSourceChanged = debounce((newSource: string | undefined) => {
    if (newSource !== undefined) {
      onChange(newSource);
      clearMarkers();
    }
  }, 100);

  return (
    <div ref={containerRef}>
      <Editor
        language={STRICT_PYTHON3_LANG_ID}
        theme={themeName}
        defaultValue={currentSource}
        onMount={handleEditorMount}
        onChange={debouncedHandleSourceChanged}
        options={{
          fontFamily: theme.custom.monospaceFontFamily,
          fontSize: 1.1 * theme.typography.fontSize,
          lineNumbers: (n) => (n + firstLineNumber - 1).toString(10),
          lineNumbersMinChars: 2,
          minimap: { enabled: false },
          renderLineHighlight: 'none',
          overviewRulerLanes: 0,
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
          scrollbar: {
            vertical: 'hidden',
            handleMouseWheel: false,
            useShadows: false,
          },
          readOnly,
        }}
      />
    </div>
  );
}
