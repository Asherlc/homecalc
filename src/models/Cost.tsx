import { isSameWeek } from "date-fns";
import { Home } from "./Home";
import Income from "./Income";
import { Issue } from "./Issue";

const CITY_TRANSFER_TAX_SPLIT = 0.5;
const CLOSING_COST_PERCENT = 2;

export function getMaximumOfferable({
  immediateIncome,
  immediateIssueCost,
  cityTransferTaxPercent,
}: {
  immediateIncome: number;
  immediateIssueCost: number;
  cityTransferTaxPercent: number;
}): number {
  return (
    (immediateIncome - immediateIssueCost) /
    (1 + cityTransferTaxPercent / 100 + CLOSING_COST_PERCENT / 100)
  );
}

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

  // This is extremely hard to figure out by my reckoning, but ~2% seems like a
  // rough ballpark
  get closingCosts(): number {
    return this.baseCost * (CLOSING_COST_PERCENT / 100);
  }

  get baseCost(): number {
    return this.home.baseCost;
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
