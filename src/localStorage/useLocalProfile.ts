import produce from 'immer';
import useLocalStorageState from 'use-local-storage-state';
import {
  DocsMetadata, METADATA_KEY,
  getDefaultMetadata,
} from './schema';

export default function useLocalProfile() {
  const [metadata, setMetadata] = useLocalStorageState(METADATA_KEY, {
    defaultValue: getDefaultMetadata(),
  });

  const docsMetadata = metadata.docs;

  const setDocsMetadata = (newDocsMetadata: DocsMetadata) => {
    setMetadata((currentMetadata) => produce(currentMetadata, (draft) => {
      draft.docs = newDocsMetadata;
    }));
  };

  return {
    metadata,
    setMetadata,
    docsMetadata,
    setDocsMetadata,
  };
}
