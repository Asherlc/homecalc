import numeral from "numeral";

export default function Currency({ children }: { children: number }) {
  return <>{numeral(children).format("$0,0")}</>;
}
