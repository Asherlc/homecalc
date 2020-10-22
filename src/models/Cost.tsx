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

export function annualTaxes(
  countyPropertyTaxPercent: number,
  baseCost: number
): number {
  return countyPropertyTaxPercent * (baseCost / 100);
}

export class Cost {
  baseCost: number;
  cityTransferTaxPercent: number;

  constructor({
    baseCost,
    cityTransferTaxPercent,
  }: {
    baseCost: number;
    cityTransferTaxPercent: number;
  }) {
    this.baseCost = baseCost;
    this.cityTransferTaxPercent = cityTransferTaxPercent;
  }

  // This is extremely hard to figure out by my reckoning, but ~2% seems like a
  // rough ballpark
  get closingCosts(): number {
    return this.baseCost * CLOSING_COST_PERCENT;
  }

  get cityTransferTax(): number {
    return (
      this.baseCost * this.cityTransferTaxPercent * CITY_TRANSFER_TAX_SPLIT
    );
  }
}
