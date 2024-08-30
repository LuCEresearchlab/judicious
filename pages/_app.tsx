import { CacheProvider, EmotionCache } from '@emotion/react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmProvider } from 'material-ui-confirm';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import createEmotionCache from '../src/createEmotionCache';
import theme from '../src/theme';
import '../style/styles.css';

// Fonts
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-sans/300.css';
import '@fontsource/fira-sans/400.css';
import '@fontsource/fira-sans/500.css';
import '@fontsource/fira-sans/700.css';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  // eslint-disable-next-line react/require-default-props
  emotionCache?: EmotionCache;
}

// eslint-disable-next-line react/require-default-props
function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const queryClient = new QueryClient();
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Judicious</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <ConfirmProvider>
          <Box sx={{
            display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'flex-start',
          }}
          >
            <QueryClientProvider client={queryClient}>
              <Component // eslint-disable-next-line react/jsx-props-no-spreading
                {...pageProps}
              />
            </QueryClientProvider>
          </Box>
        </ConfirmProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp);
