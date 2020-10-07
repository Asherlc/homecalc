const CITY_TRANSFER_TAX_SPLIT = 0.5;
const CLOSING_COST_PERCENT = 2;

export function getMaximumOfferable({
  immediateMonies,
  immediateCosts,
  percentageCosts,
}: {
  immediateMonies: number;
  immediateCosts: number;
  percentageCosts: number;
}): number {
  const dependentCosts = 1 + percentageCosts / 100 + CLOSING_COST_PERCENT / 100;
  const maximumTotalCost = (immediateMonies - immediateCosts) / dependentCosts;
  return maximumTotalCost - dependentCosts;
}

export class Cost {
  baseCost: number;
  cityTransferTaxPercent: number;
  countyPropertyTaxPercent: number;

  constructor({
    baseCost,
    cityTransferTaxPercent,
    countyPropertyTaxPercent,
  }: {
    baseCost: number;
    cityTransferTaxPercent: number;
    countyPropertyTaxPercent: number;
  }) {
    this.baseCost = baseCost;
    this.cityTransferTaxPercent = cityTransferTaxPercent;
    this.countyPropertyTaxPercent = countyPropertyTaxPercent;
  }

  // This is extremely hard to figure out by my reckoning, but ~2% seems like a
  // rough ballpark
  get closingCosts(): number {
    return this.baseCost * (CLOSING_COST_PERCENT / 100);
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
