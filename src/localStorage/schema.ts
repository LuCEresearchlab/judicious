import { type ExecutionResponse } from '../codeExecution';

export const CURRENT_VERSION = '1';

export interface Metadata {
  dataModelVersion: string;
  activities: ActivityVariantMetadata[],
  docs: DocsMetadata,
}

export interface DocsMetadata {
  showOptional: boolean,
  showDiagram: boolean,
  showTypes: boolean,
}

export interface ActivityVariantMetadata {
  id: string,
  codeCellsKey: string,
  cellsModified: boolean,
  completed: boolean,
}

export interface CodeCellState {
  source: string;
  originalIndex: number;
}

export interface CodeCellExecutionState {
  executionInProgress: boolean;
  executionResponse: ExecutionResponse | undefined;
  outputAreaVisible: boolean;
  outputSynced: boolean;
}

/* Keys for local storage */

export const METADATA_KEY = 'judicious';

export function getActivityVariantCodeCellsKey(activityVariantId: string) {
  return `${METADATA_KEY}-${activityVariantId}-codeCells`;
}

/* Default values */

export function getDefaultActivityVariantMetadata(activityVariantId: string)
  : ActivityVariantMetadata {
  return {
    id: activityVariantId,
    codeCellsKey: getActivityVariantCodeCellsKey(activityVariantId),
    cellsModified: false,
    completed: false,
  };
}

export function defaultDocsMetadata() : DocsMetadata {
  return {
    showOptional: false,
    showDiagram: true,
    showTypes: false,
  };
}

export function getDefaultMetadata() : Metadata {
  return {
    dataModelVersion: CURRENT_VERSION,
    activities: [],
    docs: defaultDocsMetadata(),
  };
}
