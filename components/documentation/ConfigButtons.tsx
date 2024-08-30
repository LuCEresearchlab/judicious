import { Category, Schema, Tune } from '@mui/icons-material';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useState } from 'react';
import useLocalProfile from '../../src/localStorage/useLocalProfile';

export const SHOW_DIAGRAM_KEY = 'diagram';
export const SHOW_OPTIONAL_KEY = 'optional';
export const SHOW_TYPES_KEY = 'types';

function tooltipMessage(key: string, active: boolean) {
  const prefix = active ? 'Hide' : 'Show';
  // eslint-disable-next-line no-nested-ternary
  const suffix = key === SHOW_DIAGRAM_KEY ? 'diagram' : key === SHOW_OPTIONAL_KEY ? 'optional parameters' : 'types';
  return `${prefix} ${suffix}`;
}

export default function ConfigButtons({ available } : { available: string[] }) {
  const { docsMetadata, setDocsMetadata } = useLocalProfile();
  const currentOptions = [];
  if (docsMetadata.showDiagram && available.includes(SHOW_DIAGRAM_KEY)) {
    currentOptions.push(SHOW_DIAGRAM_KEY);
  }
  if (docsMetadata.showOptional && available.includes(SHOW_OPTIONAL_KEY)) {
    currentOptions.push(SHOW_OPTIONAL_KEY);
  }
  if (docsMetadata.showTypes && available.includes(SHOW_TYPES_KEY)) {
    currentOptions.push(SHOW_TYPES_KEY);
  }
  const [optionsKeys, setOptionsKeys] = useState<string[]>(currentOptions);
  const handleOptionsKeys = (ev: React.MouseEvent<HTMLElement>, value: string[]) => {
    setOptionsKeys(value);
    setDocsMetadata({
      showDiagram: available.includes(SHOW_DIAGRAM_KEY)
        ? value.includes(SHOW_DIAGRAM_KEY) : docsMetadata.showDiagram,
      showOptional: available.includes(SHOW_OPTIONAL_KEY)
        ? value.includes(SHOW_OPTIONAL_KEY) : docsMetadata.showOptional,
      showTypes: available.includes(SHOW_TYPES_KEY)
        ? value.includes(SHOW_TYPES_KEY) : docsMetadata.showTypes,
    });
  };
  return (
    <ToggleButtonGroup sx={{ ml: 'auto' }} size="small" value={optionsKeys} onChange={handleOptionsKeys}>
      {available.map((key) => (
        <Tooltip key={key} title={tooltipMessage(key, optionsKeys.includes(key))} arrow>
          <ToggleButton value={key}>
            {key === SHOW_DIAGRAM_KEY && <Schema />}
            {key === SHOW_OPTIONAL_KEY && <Tune />}
            {key === SHOW_TYPES_KEY && <Category />}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
}
