import ErrorPage from "./_error";
import "../styles/globals.css";
import { AppProps } from "next/app";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { Header } from "../src/components/Header";
import { AuthProvider } from "../src/components/Login";
import Bugsnag from "../src/bugsnag";

const ErrorBoundary = Bugsnag.getPlugin("react")!.createErrorBoundary();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <AuthProvider>
        <Header />
        <Container>
          <CssBaseline />
          <Typography component="div">
            <Component {...pageProps} />
          </Typography>
        </Container>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
