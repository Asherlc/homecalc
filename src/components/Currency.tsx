import numeral from "numeral";

export default function Currency({
  children,
}: {
  children: number;
}): JSX.Element {
  return <>{numeral(children).format("$0,0")}</>;
}
