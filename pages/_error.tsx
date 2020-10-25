import ErrorPage from "next/error";

export default function Error(): JSX.Element {
  return <ErrorPage statusCode={500} />;
}
