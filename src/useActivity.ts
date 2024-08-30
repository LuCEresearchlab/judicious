import produce from 'immer';
import { useConfirm } from 'material-ui-confirm';
import { PyodideInterface } from 'pyodide';
import {
  Dispatch, SetStateAction, useCallback, useEffect,
  useState,
} from 'react';
import useSessionStorageState from 'use-session-storage-state';
import {
  ExecutionResponse, FailedExecution, isExecutionCompleted,
  isExecutionFailed,
} from './codeExecution';
import {
  CodeCellExecutionState,
  CodeCellState, Metadata,
  getDefaultActivityVariantMetadata,
} from './localStorage/schema';
import { ActivityVariant, PythonFile, activityVariantId } from './schemas/activitySchema';
import { joinLines } from './sourceUtils';
import { usePyodide } from './usePyodide';

export function initialCodeExecutionState(): CodeCellExecutionState {
  return {
    executionInProgress: false,
    executionResponse: undefined,
    outputAreaVisible: false,
    outputSynced: false,
  };
}

async function execute(sources: string[], pyodide: PyodideInterface | undefined)
  : Promise<ExecutionResponse> {
  let stdout = '';
  let stderr = '';
  const decoder = new TextDecoder();
  // eslint-disable-next-line no-alert
  pyodide?.setStdin({ stdin: () => prompt() });
  pyodide?.setStdout({ write: (buf) => { stdout += decoder.decode(buf); return buf.length; } });
  pyodide?.setStderr({ write: (buf) => { stderr += decoder.decode(buf); return buf.length; } });
  try {
    await pyodide?.runPythonAsync(joinLines(sources));
  } catch (error: any) {
    stderr += error.message;
  }
  return {
    type: stderr.length > 0 ? 'error' : 'success',
    stdout,
    stderr,
  };
}

export function sourceFromCell(cell: CodeCellState) {
  return cell.source;
}

export function useActivity(
  initialCodeCells: CodeCellState[],
  codeCells: CodeCellState[],
  setCodeCells: Dispatch<SetStateAction<CodeCellState[]>>,
  metadata: Metadata,
  setMetadata: Dispatch<SetStateAction<Metadata>>,
  activityVariant: ActivityVariant,
  extraPythonFiles: PythonFile[],
  postExecuteSingleCell:
  (idx: number, executionResponse: ExecutionResponse) => void = () => {},
) {
  const { pyodide } = usePyodide();

  const variantId = activityVariantId(activityVariant);
  const variantMetadata = metadata.activities.find((a) => a.id === variantId);

  const initialCodeExecutionStates = () => Array(initialCodeCells.length).fill(undefined)
    .map(initialCodeExecutionState);

  const [codeExecutionStates, setCodeExecutionStates] = useSessionStorageState(
    `judicious-execution-${variantId}`,
    { defaultValue: initialCodeExecutionStates() },
  );
  const [executionFailed, setExecutionFailed] = useState<FailedExecution | undefined>(undefined);

  const completed = !!variantMetadata?.completed;
  const cellsModified = !!variantMetadata?.cellsModified;

  const markAsCompleted = useCallback(() => {
    setMetadata(
      produce((draft) => {
        const draftVariantMetadata = draft.activities.find((a) => a.id === variantId);
        if (draftVariantMetadata) {
          draftVariantMetadata.completed = true;
        } else {
          const newVariantMetadata = getDefaultActivityVariantMetadata(variantId);
          newVariantMetadata.completed = true;
          draft.activities.push(newVariantMetadata);
        }
      }),
    );
  }, [variantId, setMetadata]);

  useEffect(() => {
    if (codeCells.length === 0 && !completed) {
      markAsCompleted();
    }
  }, [codeCells, completed, markAsCompleted]);

  /* Check if code cells have been modified (compared to their initial state) */
  useEffect(() => {
    const newCellsModified = JSON.stringify(codeCells) !== JSON.stringify(initialCodeCells);
    setMetadata(
      produce((draft) => {
        const draftVariantMetadata = draft.activities.find((a) => a.id === variantId);
        if (draftVariantMetadata) {
          draftVariantMetadata.cellsModified = newCellsModified;
        } else {
          const newVariantMetadata = getDefaultActivityVariantMetadata(variantId);
          newVariantMetadata.cellsModified = newCellsModified;
          draft.activities.push(newVariantMetadata);
        }
      }),
    );
  }, [codeCells, initialCodeCells, variantId, setMetadata]);

  const handleSourceChanged = (newSource: string, idx: number) => {
    setCodeCells(
      (currentCodeCells) => produce(currentCodeCells, (draft) => {
        draft[idx].source = newSource;
      }),
    );
    setCodeExecutionStates(
      (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
        // Output of all the cells from `idx` is (potentially) no longer in sync
        for (let i = idx; i < codeCells.length; i += 1) {
          draft[i].outputSynced = false;
        }
      }),
    );
  };

  const sourcesUpTo = (idx: number) => codeCells.slice(0, idx + 1).map(sourceFromCell);

  const executionStarted = (idx: number) => {
    setCodeExecutionStates(
      (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
        draft[idx].executionInProgress = true;
      }),
    );
  };

  const executionFinished = (idx: number, response: ExecutionResponse | undefined) => {
    setCodeExecutionStates(
      (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
        draft[idx].executionInProgress = false;
        if (response !== undefined) {
          if (isExecutionFailed(response)) {
            setExecutionFailed(response);
          } else {
            draft[idx].executionResponse = response;
            draft[idx].outputSynced = true;
            draft[idx].outputAreaVisible = isExecutionCompleted(response)
              && (response.stdout + response.stderr).length > 0;
            // Mark the activity as completed when the last cell has been executed successfully.
            if (response.type === 'success' && idx === codeCells.length - 1) {
              markAsCompleted();
            }
          }
        }
      }),
    );
  };

  const handleExecuteSingleCell = async (
    sources: string[],
    idx: number,
  ) => {
    executionStarted(idx);
    const response = await execute(sources, pyodide);
    executionFinished(idx, response);
    postExecuteSingleCell(idx, response);
    return response;
  };

  const handleExecute = async (idx: number) => {
    const sources = sourcesUpTo(idx);
    setExecutionFailed(undefined);
    // (Re-)Execute all cells from the first one to the current one, included.
    const responses = [];
    for (let i = 0; i <= idx; i += 1) {
      responses.push(handleExecuteSingleCell(sources, i));
    }
    const failedResponses = (await Promise.all(responses)).filter(isExecutionFailed);
    if (failedResponses.length > 0) {
      setExecutionFailed(failedResponses[0]);
    }
  };

  const handleToggleOutputArea = (idx: number) => {
    setCodeExecutionStates(
      (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
        draft[idx].outputAreaVisible = !draft[idx].outputAreaVisible;
      }),
    );
  };

  const confirm = useConfirm();
  const handleResetAllCellsNoConfirm = () => {
    setCodeCells(initialCodeCells);
    setCodeExecutionStates(initialCodeExecutionStates());
  };

  const handleResetSingleCell = (idx: number, postReset: () => void) => {
    confirm({ description: 'You are about to reset the code. This action cannot be undone! ⚠️', confirmationText: 'Ok, delete my code' })
      .then(() => {
        setCodeCells(
          (currentCodeCells) => produce(currentCodeCells, (draft) => {
            draft[idx] = initialCodeCells[idx];
          }),
        );
        setCodeExecutionStates(
          (currentCodeExecutionStates) => produce(currentCodeExecutionStates, (draft) => {
            draft[idx] = initialCodeExecutionState();
          }),
        );
        postReset();
      });
  };

  return {
    initialCodeCells,
    codeCells,
    codeExecutionStates,
    completed,
    cellsModified,
    executionFailed,
    sourcesUpTo,
    handleSourceChanged,
    handleExecute,
    handleToggleOutputArea,
    handleResetAllCellsNoConfirm,
    handleResetSingleCell,
  };
}
