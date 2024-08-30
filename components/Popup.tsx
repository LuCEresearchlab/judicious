import { styled } from '@mui/material';
import MuiPopper from '@mui/material/Popper';
import { useState } from 'react';
import theme from '../src/theme';

// Taken from https://github.com/mui/material-ui/blob/bc212467e7ebc75bec71cb6cd951041ec1c01a22/docs/data/material/components/popper/ScrollPlayground.js

const Arrow = styled('div')({
  position: 'absolute',
  fontSize: 11,
  width: '3em',
  height: '3em',
  '&::before': {
    content: '""',
    margin: 'auto',
    display: 'block',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
});

const Popper = styled(MuiPopper, {
  shouldForwardProp: (prop) => prop !== 'arrow',
})(() => ({
  zIndex: 1300,
  '& > div': {
    position: 'relative',
  },
  '&[data-popper-placement*="bottom"]': {
    '& > div': {
      marginTop: 8,
    },
    '& .MuiPopper-arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.3em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
      },
    },
  },
  '&[data-popper-placement*="top"]': {
    '& > div': {
      marginBottom: 8,
    },
    '& .MuiPopper-arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.3em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1.5em 1.5em 0 1.5em',
        borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
      },
    },
  },
  '&[data-popper-placement*="right"]': {
    '& > div': {
      marginLeft: 8,
    },
    '& .MuiPopper-arrow': {
      left: 0,
      marginLeft: '-0.8em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1.5em 1.5em 1.5em 0',
        borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
      },
    },
  },
  '&[data-popper-placement*="left"]': {
    '& > div': {
      marginRight: 8,
    },
    '& .MuiPopper-arrow': {
      right: 0,
      marginRight: '-0.8em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1.5em 0 1.5em 1.5em',
        borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
      },
    },
  },
}));

export default function Popup({
  children, id, anchorEl, open, placement,
} : {
  children: React.ReactNode,
  id: string | undefined,
  anchorEl: HTMLElement | null,
  open: boolean,
  placement: 'top' | 'bottom' | 'left' | 'right',
}) {
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);
  return (
    <Popper
      id={id}
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      modifiers={[
        {
          name: 'flip',
          enabled: true,
          options: {
            altBoundary: true,
            rootBoundary: 'viewport',
            padding: 4,
          },
        },
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            altAxis: true,
            altBoundary: true,
            tether: true,
            rootBoundary: 'viewport',
            padding: 4,
          },
        },
        {
          name: 'arrow',
          enabled: true,
          options: {
            element: arrowRef,
          },
        },
        {
          name: 'computeStyles',
          enabled: true,
        },
      ]}
    >
      <Arrow ref={setArrowRef} className="MuiPopper-arrow" />
      {children}
    </Popper>
  );
}
