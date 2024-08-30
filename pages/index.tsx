import {
  Box,
  Container, Typography,
} from '@mui/material';
import Head from 'next/head';
import { useState } from 'react';
import MoreOptionsButton from '../components/MoreOptionsButton';
import PageFooter from '../components/PageFooter';
import SolitaryCodeCell, { initialStateSingleCell } from '../components/SolitaryCodeCell';
import useLocalActivity from '../src/localStorage/useLocalActivity';
import { playgroundActivityVariant, playgroundInitialSource } from '../src/playground';
import { translationProps } from '../src/serverSideTranslationProps';
import useReset from '../src/useReset';

export default function Playground() {
  const localActivity = useLocalActivity(
    initialStateSingleCell(playgroundInitialSource),
    playgroundActivityVariant,
  );
  const {
    codeCells, codeExecutionStates,
    handleToggleOutputArea, handleResetSingleCell,
  } = localActivity;

  const { resetCounter, newReset } = useReset();

  const [fullWidthCell, setFullWidthCell] = useState(false);

  return (
    <div>
      <Head>
        <title>Judicious Playground</title>
      </Head>
      <Box sx={{
        display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'flex-start',
      }}
      >
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" align="center" mt={4} mb={8}>Judicious Playground</Typography>
          <Container maxWidth={fullWidthCell ? false : 'lg'}>
            <SolitaryCodeCell
              resetCounter={resetCounter}
              activity={localActivity}
              extraActions={(
                <MoreOptionsButton
                  codeCellState={codeCells[0]}
                  codeCellExecutionState={codeExecutionStates[0]}
                  onShowHideOutput={() => handleToggleOutputArea(0)}
                  onReset={() => handleResetSingleCell(0, newReset)}
                  fullWidthCell={fullWidthCell}
                  onFullWidthToggle={() => setFullWidthCell(!fullWidthCell)}
                />
                )}
            />
          </Container>
        </Box>
        <PageFooter />
      </Box>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      ...await translationProps(),
    },
  };
}
