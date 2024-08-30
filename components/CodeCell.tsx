import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import {
  Badge,
  BadgeProps,
  Card, CardActions, CardContent, Collapse, Paper,
  Stack,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'next-i18next';
import { ExecutionResponse, isExecutionCompleted } from '../src/codeExecution';
import { CodeCellExecutionState } from '../src/localStorage/schema';
import CodeEditor from './CodeEditor';
import OutputArea from './OutputArea';
import RunButton from './RunButton';
import DocumentationStripe from './documentation/DocumentationStripe';

const StaleOutputBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    right: '1rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  width: '100%',
}));

export function isExecutionError(response: ExecutionResponse | undefined) {
  return response?.type === 'error';
}

export default function CodeCell({
  initialSource, currentSource, codeCellExecutionState, onSourceChanged, onExecutionRequested,
  firstLineNumber, resetCounter,
  extraActions = null, readOnly = false,
} :
{ initialSource: string,
  currentSource: string,
  codeCellExecutionState: CodeCellExecutionState,
  onSourceChanged: (newSource: string) => void,
  onExecutionRequested: () => Promise<any>,
  firstLineNumber : number,
  resetCounter: number,
  extraActions?: React.ReactNode
  readOnly?: boolean
}) {
  const { t } = useTranslation(['common']);
  const { executionResponse } = codeCellExecutionState;
  const executionError = isExecutionError(executionResponse);
  const executing = codeCellExecutionState.executionInProgress;
  const executionFinished = codeCellExecutionState.outputSynced;

  return (
    <Paper elevation={readOnly ? 0 : 2}>
      {!readOnly
        && <DocumentationStripe source={currentSource} />}
      <Card elevation={0}>
        <CardContent>
          <CodeEditor
            initialSource={initialSource}
            currentSource={currentSource}
            onChange={onSourceChanged}
            onExecutionRequested={onExecutionRequested}
            executionAllowed={!executing && !executionFinished}
            executionFinished={executionFinished}
            firstLineNumber={firstLineNumber}
            readOnly={readOnly}
            executionResponse={executionResponse}
            collapsedErrorMarkers={false}
            resetCounter={resetCounter}
          />
        </CardContent>
        <CardActions disableSpacing sx={{ paddingLeft: 2, display: 'flex' }}>
          <RunButton
            onExecutionRequested={onExecutionRequested}
            executing={executing}
            executionFinished={executionFinished}
            executionError={executionError}
          />
          <Stack direction="row" sx={{ marginLeft: 'auto' }}>
            {extraActions}
          </Stack>
        </CardActions>
        <Collapse in={codeCellExecutionState.outputAreaVisible} timeout="auto" unmountOnExit>
          <CardContent>
            <StaleOutputBadge
              badgeContent={<Tooltip arrow title={t('staleOutput')}><SyncProblemIcon /></Tooltip>}
              color="error"
              invisible={codeCellExecutionState.outputSynced}
            >
              {executionResponse && isExecutionCompleted(executionResponse) && (
              <OutputArea
                executionError={executionError}
                executionResponse={executionResponse}
                dimmed={!codeCellExecutionState.outputSynced}
              />
              )}
            </StaleOutputBadge>
          </CardContent>
        </Collapse>
      </Card>
    </Paper>
  );
}
