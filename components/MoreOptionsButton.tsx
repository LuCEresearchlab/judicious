import {
  CloseFullscreen,
  ContentCopy,
  MoreVert,
  OpenInFull,
  RestartAlt,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  IconButton,
  ListItemIcon,
  Menu, MenuItem,
} from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { CodeCellExecutionState, CodeCellState } from '../src/localStorage/schema';

export default function MoreOptionsButton({
  codeCellState, codeCellExecutionState, fullWidthCell,
  onShowHideOutput, onReset, onFullWidthToggle,
} :
{ codeCellState: CodeCellState, codeCellExecutionState: CodeCellExecutionState,
  fullWidthCell: boolean,
  onShowHideOutput: () => void, onReset: () => void, onFullWidthToggle: () => void, }) {
  const { t } = useTranslation(['common']);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleCopy = () => {
    handleClose();
    navigator.clipboard.writeText(codeCellState.source);
  };
  const handleShowHideOutputArea = () => {
    handleClose();
    onShowHideOutput();
  };
  const handleFullWidthToggle = () => {
    handleClose();
    onFullWidthToggle();
  };
  const handleReset = () => {
    handleClose();
    onReset();
  };
  return (
    <>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
          },
        }}
      >
        <MenuItem onClick={handleReset}>
          <ListItemIcon sx={{ verticalAlign: 'middle' }}>
            <RestartAlt fontSize="small" />
          </ListItemIcon>
          {t('resetCell')}
        </MenuItem>
        <MenuItem onClick={handleCopy}>
          <ListItemIcon sx={{ verticalAlign: 'middle' }}>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          {t('copyCode')}
        </MenuItem>
        <MenuItem onClick={handleFullWidthToggle} sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
          <ListItemIcon sx={{ verticalAlign: 'middle' }}>
            { fullWidthCell ? <CloseFullscreen fontSize="small" /> : <OpenInFull fontSize="small" />}
          </ListItemIcon>
          { t(`${fullWidthCell ? 'normal' : 'wide'}Width`) }
        </MenuItem>
        { codeCellExecutionState.executionResponse && (
        <MenuItem onClick={handleShowHideOutputArea}>
          <ListItemIcon sx={{ verticalAlign: 'middle' }}>
            { codeCellExecutionState.outputAreaVisible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </ListItemIcon>
          { t(`${codeCellExecutionState.outputAreaVisible ? 'hide' : 'show'}Output`) }
        </MenuItem>
        )}
      </Menu>
    </>
  );
}
