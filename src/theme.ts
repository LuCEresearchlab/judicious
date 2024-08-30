import { red } from '@mui/material/colors';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      monospaceFontFamily: string;
      redColor: string,
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    custom?: {
      monospaceFontFamily?: string;
      redColor?: string,
    };
  }

  interface Palette {
    neutral: Palette['primary'];
  }

  // allow configuration using `createTheme`
  interface PaletteOptions {
    neutral?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/CircularProgress' {
  interface CircularProgressPropsColorOverrides {
    neutral: true;
  }
}
declare module '@mui/material/ToggleButton' {
  interface ToggleButtonPropsColorOverrides {
    neutral: true;
  }
}
declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    neutral: true;
  }
}

// Create a theme instance.
const theme = responsiveFontSizes(createTheme({
  palette: {
    primary: {
      main: '#008BCB',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    neutral: {
      main: '#fff',
    },
  },
  custom: {
    monospaceFontFamily: "'Fira Code', monospace",
    redColor: '#D2071D',
  },
  typography: {
    fontFamily: "'Fira Sans', sans-serif",
  },
}), { factor: 1.5 });

export default theme;
