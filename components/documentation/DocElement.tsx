/* eslint-disable react/no-danger */
/* eslint-disable @next/next/no-img-element */
import {
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { JudiciousElement } from '../../src/schemas/documentation';
import theme from '../../src/theme';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';
import DocElementCard from './DocElementCard';
import { iconPath } from './utils';

export default function DocElement({
  module, element, smallerFont,
} :
{ module: string, element: JudiciousElement,
  smallerFont: boolean }) {
  const [hover, setHover] = useState(false);

  return (element ? (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        borderRadius: '0.5em',
        backgroundColor: hover ? theme.palette.action.hover : 'transparent',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Popover placement="right">
        <PopoverTrigger>
          <img
            src={iconPath(module)}
            style={{
              height: smallerFont ? '0.8em' : '1em', width: 'auto', display: 'inline-block', transform: `translateY(.${smallerFont ? '1' : '2'}em)`, marginRight: '0.1em',
            }}
            alt="Module logo"
          />
          <Typography
            component="span"
            style={{
              color: theme.custom.redColor,
              fontSize: smallerFont ? '0.8em' : '1em',
              fontFamily: theme.custom.monospaceFontFamily,
            }}
            translate="no"
          >
            {element.name}
          </Typography>
        </PopoverTrigger>
        <PopoverContent>
          <DocElementCard module={module} element={element} />
        </PopoverContent>
      </Popover>
    </div>
  ) : null
  );
}
