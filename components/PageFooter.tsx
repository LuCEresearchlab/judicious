import { Container, Link, Typography } from '@mui/material';

export default function PageFooter() {
  return (
    <Container maxWidth="lg" sx={{ mt: 'auto', mb: 2 }}>
      <Typography variant="body2" align="center">
        <strong>Judicious</strong>
        {' '}
        is a project created by
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
