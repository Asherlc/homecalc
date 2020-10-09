import "../styles/globals.css";
import { AppProps } from "next/app";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { Header } from "../src/components/Header";
import { AuthProvider } from "../src/components/Login";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Header />
      <Container>
        <CssBaseline />
        <Typography component="div">
          <Component {...pageProps} />
        </Typography>
      </Container>
    </AuthProvider>
  );
}

export default MyApp;
