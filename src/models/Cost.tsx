import { isSameWeek } from "date-fns";
import { add } from "lodash";
import { Home } from "./Home";
import Income from "./Income";
import { Issue } from "./Issue";

const CITY_TRANSFER_TAX_SPLIT = 0.5;

export class Cost {
  issues: Issue[];
  incomes: Income[];
  home: Home;
  cityTransferTaxPercent: number;
  countyPropertyTaxPercent: number;

  constructor({
    issues,
    home,
    incomes,
    cityTransferTaxPercent,
    countyPropertyTaxPercent,
  }: {
    issues: Issue[];
    incomes: Income[];
    home: Home;
    cityTransferTaxPercent: number;
    countyPropertyTaxPercent: number;
  }) {
    this.issues = issues;
    this.home = home;
    this.cityTransferTaxPercent = cityTransferTaxPercent;
    this.countyPropertyTaxPercent = countyPropertyTaxPercent;
    this.incomes = incomes;
  }

  get totalImmediateIssueCost(): number {
    return this.immediateIssues.reduce((total, issue) => {
      return add(total, issue.buyerCost as number);
    }, 0);
  }

  get totalImmediateIncome(): number {
    return this.immediateIncomes.reduce((total, income) => {
      return add(total, income.amount);
    }, 0);
  }

  get offerableAmount(): number {
    return this.totalImmediateIncome - this.totalImmediateIssueCost;
  }

  get baseCost(): number {
    return this.home.baseCost;
  }

  get immediateIssues(): Issue[] {
    return this.issues.filter(
      (issue) =>
        issue.buyerCost &&
        issue.requiredInDate &&
        isSameWeek(issue.requiredInDate, new Date())
    );
  }

  get immediateIncomes(): Income[] {
    return this.incomes.filter(
      (income) =>
        income.amount &&
        income.availableInDate &&
        isSameWeek(income.availableInDate, new Date())
    );
  }

  get total(): number {
    return this.totalImmediateIssueCost + this.baseCost + this.cityTransferTax;
  }

  get annualTaxes(): number {
    return (this.countyPropertyTaxPercent / 100) * this.baseCost;
  }

  get cityTransferTax(): number {
    return (
      this.baseCost *
      (this.cityTransferTaxPercent / 100) *
      CITY_TRANSFER_TAX_SPLIT
    );
  }
}
