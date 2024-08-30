import { Done, ErrorOutline, PlayCircleFilled } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Stack, Tooltip } from '@mui/material';
import { useTranslation } from 'next-i18next';

export default function RunButton({
  onExecutionRequested, executing, executionFinished, executionError,
} :
{ onExecutionRequested: () => Promise<any>, executing: boolean, executionFinished: boolean,
  executionError: boolean }) {
  const { t } = useTranslation(['common']);
  let buttonMessage = t('runCode');
  const buttonTooltip = ''; // Empty tooltips are not displayed
  if (executing) {
    buttonMessage = t('runningCode');
  }
  const showPlayIcon = !executing;
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Tooltip arrow title={buttonTooltip} placement="top">
        <span>
          <LoadingButton
            onClick={onExecutionRequested}
            endIcon={showPlayIcon && <PlayCircleFilled />}
            loading={executing}
            loadingPosition={showPlayIcon || executing ? 'end' : undefined}
            variant="contained"
            sx={{ minWidth: '10rem' }}
            disabled={executing}
            className="run-button"
          >
            <span>{buttonMessage}</span>
          </LoadingButton>
        </span>
      </Tooltip>
      {executionFinished
      && (executionError
        ? <Tooltip arrow title={t('executionCompletedWithErrors')} placement="right"><ErrorOutline color="error" /></Tooltip>
        : <Tooltip arrow title={t('executionCompletedSuccessfully')} placement="right"><Done color="success" /></Tooltip>)}
    </Stack>
  );
}
