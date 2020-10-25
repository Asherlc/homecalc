import { SWRConfig } from "swr";
import ErrorPage from "./_error";
import "../styles/globals.css";
import { AppProps } from "next/app";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import { Header } from "../src/components/Header";
import { AuthProvider } from "../src/components/Login";
import Bugsnag from "../src/bugsnag";
import { useEffect } from "react";
import handleException from "../src/handleException";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const ErrorBoundary = Bugsnag.getPlugin("react")!.createErrorBoundary();

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      <SWRConfig
        value={{
          onError: (error) => {
            if (error.status !== 403 && error.status !== 404) {
              handleException(error);
            }
          },
        }}
      >
        <AuthProvider>
          <Header />
          <Container>
            <CssBaseline />
            <Typography component="div">
              <Component {...pageProps} />
            </Typography>
          </Container>
        </AuthProvider>
      </SWRConfig>
    </ErrorBoundary>
  );
}

export default MyApp;
