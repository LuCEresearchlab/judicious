import useLocalStorageState from 'use-local-storage-state';
import { ActivityVariant, PythonFile, activityVariantId } from '../schemas/activitySchema';
import { useActivity } from '../useActivity';
import {
  CodeCellState,
  getActivityVariantCodeCellsKey,
} from './schema';
import useLocalProfile from './useLocalProfile';

export default function useLocalActivity(
  initialCodeCells: CodeCellState[],
  activityVariant: ActivityVariant,
  extraPythonFiles: PythonFile[] = [],
) {
  const { metadata, setMetadata } = useLocalProfile();
  const variantId = activityVariantId(activityVariant);
  const variantMetadata = metadata.activities.find((a) => a.id === variantId);
  const [codeCells, setCodeCells] = useLocalStorageState(
    variantMetadata?.codeCellsKey || getActivityVariantCodeCellsKey(variantId),
    { defaultValue: initialCodeCells },
  );
  const activity = useActivity(
    initialCodeCells,
    codeCells,
    setCodeCells,
    metadata,
    setMetadata,
    activityVariant,
    extraPythonFiles,
  );
  const localCodeCellsWrongLength = codeCells.length !== initialCodeCells.length
    || activity.codeExecutionStates.length !== codeCells.length;
  return {
    ...activity,
    localCodeCellsWrongLength,
  };
}
