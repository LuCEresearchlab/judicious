import { Container, Link, Typography } from '@mui/material';

export default function PageFooter() {
  return (
    <Container maxWidth="lg" sx={{ mt: 'auto', mb: 3 }}>
      <Typography variant="body1" align="center" fontSize="1.2rem" mb={2}>
        Check out
        {' '}
        <Link href="https://pytamaro.si.usi.ch/"><strong>PyTamaro</strong></Link>
        ,
        {' '}
        a web-based educational Python environment that uses
        {' '}
        <Link href="https://pytamaro.si.usi.ch/documentation">Judicious documentation</Link>
      </Typography>
      <Typography variant="body1" align="center" fontSize="1.2rem">
        <strong>Judicious</strong>
        {' '}
        is an
        {' '}
        <Link href="https://github.com/LuCEresearchlab/judicious">open-source project</Link>
        {' '}
        created by
        the&nbsp;
        <Link href="https://luce.si.usi.ch/">Lugano Computing Education Research Lab</Link>
        &nbsp;at the&nbsp;
        <Link href="https://si.usi.ch/">Software Institute</Link>
        &nbsp;of&nbsp;
        <Link href="https://www.usi.ch/">USI</Link>
      </Typography>
    </Container>
  );
}
