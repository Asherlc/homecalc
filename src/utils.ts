import { isSameWeek } from "date-fns";
import Money from "./models/Money";
import { Issue } from "./models/Issue";

type LineItem = Record<string, any>;

export function withImmediateLineItems(key: string) {
  return function (lineItems: LineItem[]): LineItem[] {
    return lineItems.filter(
      (lineItem) => lineItem[key] && isSameWeek(lineItem[key], new Date())
    );
  };
}

export function sumLineItemsBy(key: string) {
  return function (lineItems: LineItem[]): number {
    return lineItems.reduce((total, lineItem) => {
      return total + lineItem[key];
    }, 0);
  };
}

export function sumImmediateIssues(issues: Issue[]): number {
  const immediate = withImmediateLineItems("requiredInDate")(issues);
  return sumLineItemsBy("buyerCost")(immediate);
}

export function sumImmediateMonies(monies: Money[]): number {
  const immediate = withImmediateLineItems("availableInDate")(monies);
  return sumLineItemsBy("amount")(immediate);
}
