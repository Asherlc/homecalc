import { formatMoney } from "accounting";

export default function Currency({ children }: { children: number }) {
  return <>{formatMoney(children, undefined, 0)}</>;
}
