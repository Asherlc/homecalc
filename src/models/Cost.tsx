export const CITY_TRANSFER_TAX_SPLIT = 0.5;
export const CLOSING_COST_PERCENT = 0.02;

export function getMaximumOfferable({
  immediateMonies,
  immediateCosts,
  percentageCosts,
}: {
  immediateMonies: number;
  immediateCosts: number;
  percentageCosts: number;
}): number {
  const dependentCosts = 1 + percentageCosts + CLOSING_COST_PERCENT;
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
    return this.baseCost * CLOSING_COST_PERCENT;
  }

  get annualTaxes(): number {
    return this.countyPropertyTaxPercent * this.baseCost;
  }

  get cityTransferTax(): number {
    return (
      this.baseCost * this.cityTransferTaxPercent * CITY_TRANSFER_TAX_SPLIT
    );
  }
}
