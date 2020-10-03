import "../styles/globals.css";
import { AppProps } from "next/app";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { Header } from "../src/components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <Container>
        <CssBaseline />
        <Typography component="div">
          <Component {...pageProps} />
        </Typography>
      </Container>
    </>
  );
}

export default MyApp;
