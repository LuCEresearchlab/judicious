import { Typography } from '@mui/material';
import theme from '../../src/theme';

export default function CodeElement({ children, type = false, bold = false }
: { children: string, type?: boolean, bold?: boolean }) {
  const isSpace = children.trim().length === 0;
  return (
    <Typography
      component="span"
      sx={{ display: 'inline-block' }}
      fontFamily={(type || isSpace) ? undefined : theme.custom.monospaceFontFamily}
      fontWeight={bold ? 'bold' : 'normal'}
      fontStyle={type ? 'italic' : 'normal'}
    >
      {children}
    </Typography>
  );
}
