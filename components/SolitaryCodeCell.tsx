import { useEffect } from 'react';
import { useActivity } from '../src/useActivity';
import CodeCell from './CodeCell';

export function initialStateSingleCell(source: string) {
  return [{ source, originalIndex: 0 }];
}

export function emptySingleCell() {
  return initialStateSingleCell('');
}

export default function SolitaryCodeCell({
  activity, resetCounter = 0, readOnly = false, requireNewExecution = false,
  postSourceChange = () => {}, onExecutionRequest = () => {},
  extraActions = null,
} :
{ activity: ReturnType<typeof useActivity>,
  resetCounter?: number,
  readOnly?: boolean,
  requireNewExecution?: boolean,
  postSourceChange?: (newSource: string) => void,
  onExecutionRequest?: () => void,
  extraActions?: React.ReactNode
}) {
  const {
    initialCodeCells, codeCells, codeExecutionStates,
    handleSourceChanged, handleExecute,
  } = activity;
  useEffect(() => {
    if (requireNewExecution) {
      // Simulate a change in the source code to invalidate an eventual previous execution
      handleSourceChanged(codeCells[0].source, 0);
    }
  });
  return (
    <CodeCell
      initialSource={initialCodeCells[0].source}
      currentSource={codeCells[0].source}
      codeCellExecutionState={codeExecutionStates[0]}
      onSourceChanged={(newSource) => {
        handleSourceChanged(newSource, 0);
        postSourceChange(newSource);
      }}
      onExecutionRequested={() => {
        onExecutionRequest();
        return handleExecute(0);
      }}
      firstLineNumber={1}
      readOnly={readOnly}
      extraActions={extraActions}
      resetCounter={resetCounter}
    />
  );
}
