import { isSameWeek } from "date-fns";
import { add } from "lodash";
import { Home } from "./Home";
import { Issue } from "./Issue";

const OAKLAND_CITY_TRANSFER_TAX_PERCENT = 1.5;
const CITY_TRANSFER_TAX_SPLIT = 0.5;

export class Cost {
  issues: Issue[];
  home: Home;

  constructor({ issues, home }: { issues: Issue[]; home: Home }) {
    this.issues = issues;
    this.home = home;
  }

  get totalImmediateIssueCost() {
    return this.immediateIssues.reduce((total, issue) => {
      return add(total, issue.buyerCost as number);
    }, 0);
  }

  get baseCost(): number {
    return this.home.baseCost;
  }

  get countyTaxRate() {
    return this.home.countyTaxRate;
  }

  get immediateIssues() {
    return this.issues.filter(
      (issue) =>
        issue.buyerCost &&
        issue.requiredInDate &&
        isSameWeek(issue.requiredInDate, new Date())
    );
  }

  get total() {
    return this.totalImmediateIssueCost + this.baseCost + this.cityTransferTax;
  }

  get annualTaxes() {
    return Number((this.countyTaxRate / 100) * this.baseCost).toFixed(2);
  }

  get cityTransferTax() {
    return (
      this.baseCost *
      (OAKLAND_CITY_TRANSFER_TAX_PERCENT / 100) *
      CITY_TRANSFER_TAX_SPLIT
    );
  }
}
