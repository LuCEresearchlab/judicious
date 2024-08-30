/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
import {
  Card,
  CardContent,
  ClickAwayListener,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { PythonFunction } from '../../src/python-analyzer/python_analyzer';
import { JudiciousDocModule } from '../../src/schemas/documentation';
import theme from '../../src/theme';
import Popup from '../Popup';
import FunctionDocumentation from './FunctionDocumentation';
import TypeConstantDocumentation from './TypeConstantDocumentation';
import { definedFnToJudiciousDocFunction, iconPath } from './utils';

export default function LibraryName({
  name, module, smallerFont, definedFunctions = [],
} :
{ name: string,
  module: string,
  smallerFont: boolean,
  definedFunctions?: PythonFunction[]
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const definedFunctionsData = {
    module: '.',
    elements: definedFunctions.map(definedFnToJudiciousDocFunction),
  };

  const { isLoading, error, data } = useQuery<JudiciousDocModule>({
    queryKey: [module, definedFunctions],
    queryFn: () => {
      if (module === '.') return definedFunctionsData;
      return axios.get(`/docs/${module}.json`)
        .then((response) => response.data);
    },
  });

  const element = data?.elements?.find((e) => e.name === name);

  const open = Boolean(anchorEl);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const [hover, setHover] = useState(false);

  return (element ? (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        borderRadius: '0.5em',
        backgroundColor: hover ? theme.palette.action.hover : 'transparent',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <img
        src={iconPath(module)}
        style={{
          height: smallerFont ? '0.8em' : '1em', width: 'auto', display: 'inline-block', transform: `translateY(.${smallerFont ? '1' : '2'}em)`,
        }}
        alt="Module logo"
      />
      <ClickAwayListener onClickAway={handlePopoverClose} mouseEvent="onMouseUp">
        <div>
          <Typography
            component="span"
            aria-owns={open ? 'doc-popover' : undefined}
            aria-haspopup="true"
            onClick={handlePopoverOpen}
            style={{
              fontSize: smallerFont ? '0.8em' : '1em',
              fontFamily: theme.custom.monospaceFontFamily,
              cursor: 'pointer',
            }}
          >
            {name}
          </Typography>
          <Popup
            id="doc-popup"
            open={open}
            anchorEl={anchorEl}
            placement="right"
          >
            {isLoading ? <Typography component="span">Loading the documentation...</Typography> : null}
            {error ? <Typography component="span">Failed to load the documentation.</Typography> : null}
            {element && (
            <Card elevation={20}>
              <CardContent sx={{
                pb: 1, minWidth: '60ch', maxWidth: '90ch', fontVariantLigatures: 'none',
              }}
              >
                {element.kind === 'function'
                  ? <FunctionDocumentation fn={element} module={module} />
                  : <TypeConstantDocumentation element={element} module={module} />}
              </CardContent>
            </Card>
            )}
          </Popup>
        </div>
      </ClickAwayListener>
    </span>
  ) : null
  );
}
