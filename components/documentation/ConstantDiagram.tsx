/* eslint-disable react/jsx-props-no-spreading */
import { Box } from '@mui/material';
import { JudiciousConstant } from '../../src/schemas/documentation';
import theme from '../../src/theme';
import {
  DARK_HOVER_COLOR,
  hoverProps,
  iconPath,
  moduleId,
  nameId,
} from './utils';

const DARK_COLOR = '#008bcb';
const LIGHT_COLOR = '#d1f0ff';

export default function ConstantDiagram({
  constant, module, hoverElement, setHoverElement,
} :
{ constant: JudiciousConstant, module: string, hoverElement: string,
  setHoverElement: (hover: string) => void }) {
  const {
    name,
  } = constant;
  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center',
    }}
    >
      <svg width="100%" height="130px">
        <defs>
          <polygon
            id="typeconstant-arrowhead"
            points="0,0 12,6 0,12"
            fill={DARK_COLOR}
          />
        </defs>
        <g>
          <rect x="25%" y="5%" width="50%" height="85%" fill={LIGHT_COLOR} stroke={DARK_COLOR} strokeWidth="3" />
          <rect x="50%" y="8%" width="28" height="20" transform="translate(-14, 0)" fill={hoverElement === moduleId() ? DARK_HOVER_COLOR : 'transparent'} />
          <rect x="40%" y="45%" width="20%" height="20" transform="translate(0, -12)" fill={hoverElement === nameId() ? DARK_HOVER_COLOR : 'transparent'} />
          <image href={iconPath(module)} x="50%" y="8%" width="20" height="20" transform="translate(-10, 0)" {...hoverProps(moduleId(), hoverElement, setHoverElement, true)} />
          <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fontSize="1.1em" fontWeight="bold" fontFamily={theme.custom.monospaceFontFamily} {...hoverProps(nameId(), hoverElement, setHoverElement, true)}>{name}</text>
          <use x="75%" y="45%" href="#typeconstant-arrowhead" transform="translate(0, -6)" />
        </g>
      </svg>
    </Box>
  );
}
