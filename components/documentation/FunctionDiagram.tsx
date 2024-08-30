/* eslint-disable react/jsx-props-no-spreading */
import { Box, Tooltip } from '@mui/material';
import useLocalProfile from '../../src/localStorage/useLocalProfile';
import { JudiciousDocFunction } from '../../src/schemas/documentation';
import theme from '../../src/theme';
import {
  HOVER_COLOR, hoverProps, iconPath,
  moduleId,
  nameId,
  paramId,
  returnId,
  visibleParameters,
} from './utils';

const DARK_COLOR = '#d2071d';
const LIGHT_COLOR = '#fed4d9';

export default function FunctionDiagram({
  fn, module, hoverElement, setHoverElement,
} :
{ fn: JudiciousDocFunction,
  module: string,
  hoverElement: string,
  setHoverElement: (hover: string) => void }) {
  const {
    name, parameters, returnValue,
  } = fn;
  const { docsMetadata } = useLocalProfile();
  const params = visibleParameters(parameters, docsMetadata.showOptional);
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <svg width="100%" height={110 + 20 * params.length}>
        <defs>
          <polygon
            id="arrowhead"
            points="0,0 12,6 0,12"
            fill="#D2071D"
          />
        </defs>
        <g>
          <rect x="30%" y="5%" width="40%" height="90%" fill={LIGHT_COLOR} stroke={DARK_COLOR} strokeWidth="3" rx="3%" />
          <rect x="50%" y="8%" width="28" height="20" transform="translate(-14, 0)" fill={hoverElement === moduleId() ? HOVER_COLOR : 'transparent'} />
          <image href={iconPath(module)} x="50%" y="8%" width="20" height="20" transform="translate(-10, 0)" {...hoverProps(moduleId(), hoverElement, setHoverElement)} />
          <rect x="40%" y="50%" width="20%" height="20" transform="translate(0, -12)" fill={hoverElement === nameId() ? HOVER_COLOR : 'transparent'} />
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fontSize="1.1em" fontWeight="bold" fontFamily={theme.custom.monospaceFontFamily} {...hoverProps(nameId(), hoverElement, setHoverElement)}>{name}</text>
        </g>
        {params.map((param, i) => {
          const y = ((i + 1) * 100) / (params.length + 1);
          const variableLengthVisible = docsMetadata.showOptional && param.variableLength;
          const dashed = param.default || variableLengthVisible;
          return (
            // eslint-disable-next-line react/no-array-index-key
            <g key={i} {...hoverProps(paramId(i), hoverElement, setHoverElement)}>
              <rect x="2%" y={`${y}%`} width="26%" height="20" transform="translate(0, -24)" fill={hoverElement === paramId(i) ? HOVER_COLOR : 'white'} />
              <line x1="2%" x2="30%" stroke={DARK_COLOR} strokeWidth="3" y1={`${y}%`} y2={`${y}%`} stroke-dasharray={dashed ? '10 4' : 'none'} />
              <use x="30%" y={`${y}%`} href="#arrowhead" transform="translate(-11, -6)" />
              {variableLengthVisible && (
                <>
                  <use x="27%" y={`${y}%`} href="#arrowhead" transform="translate(-11, -6)" />
                  <use x="28.5%" y={`${y}%`} href="#arrowhead" transform="translate(-11, -6)" />
                </>
              )}
              <text transform="translate(0, -8)" x="27%" y={`${y}%`} dominantBaseline="text-top" text-anchor="end" fontFamily={theme.custom.monospaceFontFamily}>{param.name}</text>
            </g>
          );
        })}
        {returnValue && (
          <g {...hoverProps(returnId(), hoverElement, setHoverElement)}>
            <rect x="72%" y="50%" width="23%" height="20" transform="translate(0, -24)" fill={hoverElement === returnId() ? HOVER_COLOR : 'white'} />
            <line x1="70%" x2="97%" stroke={DARK_COLOR} strokeWidth="3" y1="50%" y2="50%" />
            <use x="98%" y="50%" href="#arrowhead" transform="translate(-12, -6)" />
            {docsMetadata.showTypes && (
            <text transform="translate(0, -8)" x="73%" y="50%" dominantBaseline="text-top" text-anchor="start" fontStyle="italic">{returnValue.type}</text>
            )}
          </g>
        )}
        {fn.sideEffects && (
          <Tooltip title="Calling this function causes side effects" arrow>
            <image href="/boom.png" x="68%" y="95%" width="36" height="36" transform="translate(-36, -46)" />
          </Tooltip>
        )}
      </svg>
    </Box>
  );
}
