import "../styles/globals.css";
import { AppProps } from "next/app";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <Typography component="div">
        <Component {...pageProps} />
      </Typography>
    </Container>
  );
}

export default MyApp;
