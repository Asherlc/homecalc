import ErrorPage from "next/error";

export default function NotFound(): JSX.Element {
  return <ErrorPage statusCode={404} />;
}
