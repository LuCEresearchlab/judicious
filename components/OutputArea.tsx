import {
  Card,
  Collapse,
  ToggleButton,
} from '@mui/material';
import {
  CSSProperties,
  useState,
} from 'react';
import { CompletedExecutionResponse } from '../src/codeExecution';
import { processTraceback } from '../src/pythonTraceback';
import { joinLines, splitLines } from '../src/sourceUtils';
import theme from '../src/theme';

const BACKGROUND_COLOR = theme.palette.grey[50];

const OUTPUT_ELEMENT_STYLE = {
  display: 'block',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
};

function SinglePreElement({ style = {}, lines } : { style?: CSSProperties, lines: string[] }) {
  return (
    <pre style={{ ...OUTPUT_ELEMENT_STYLE, ...style }}>{joinLines(lines)}</pre>
  );
}

function CodeElement({ content } : { content : string }) {
  const [showAllStackFrames, setShowAllStackFrames] = useState(false);

  const {
    errorLines, userTracebackLines, libraryTracebackLines, collapsed,
  } = processTraceback(content);

  return (
    <div>
      {collapsed && (
        <div>
          <ToggleButton
            value="check"
            selected={showAllStackFrames}
            onChange={() => setShowAllStackFrames(!showAllStackFrames)}
            sx={{ paddingY: 0.5, marginLeft: '2ch' }}
          >
            {`${showAllStackFrames ? 'Hide' : 'Show All '} Stack Frames`}
          </ToggleButton>
          <Collapse in={showAllStackFrames} timeout="auto" unmountOnExit>
            <SinglePreElement lines={libraryTracebackLines} />
          </Collapse>
        </div>
      )}
      <SinglePreElement lines={userTracebackLines} />
      <SinglePreElement style={{ fontWeight: 'bold' }} lines={errorLines} />
    </div>
  );
}

export default function OutputArea(
  { executionError, executionResponse, dimmed = false }:
  { executionError: boolean, executionResponse: CompletedExecutionResponse, dimmed?: boolean },
) {
  const { stdout, stderr } = executionResponse;
  return (
    <Card
      variant="outlined"
      sx={{
        backgroundColor: BACKGROUND_COLOR,
        position: 'relative',
        overflowX: 'auto',
        width: '100%',
        px: 2,
        borderColor: executionError ? 'error.main' : undefined,
        ...(dimmed ? { opacity: theme.palette.action.disabledOpacity } : {}),
      }}
    >
      <div className="output-area">
        <SinglePreElement lines={splitLines(stdout)} />
        {stderr ? <CodeElement content={stderr} /> : null}
      </div>
    </Card>
  );
}
