import { sum } from "lodash";

export const CITY_TRANSFER_TAX_SPLIT = 0.5;
export const CLOSING_COST_PERCENT = 0.02;

export function getMaximumOfferable({
  immediateMonies,
  immediateCosts,
  percentageCosts,
}: {
  immediateMonies: number;
  immediateCosts: number;
  percentageCosts: number[];
}): number {
  const dependentCosts = sum([1, CLOSING_COST_PERCENT, ...percentageCosts]);
  const maximumTotalCost = (immediateMonies - immediateCosts) / dependentCosts;
  return maximumTotalCost - dependentCosts;
}

export function annualTaxes(
  countyPropertyTaxPercent: number,
  baseCost: number
): number {
  return countyPropertyTaxPercent * (baseCost / 100);
}
