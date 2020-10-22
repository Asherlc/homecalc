import { useCurrentHome } from "./useCurrentHome";
import { Cost } from "../models/Cost";
import useSWR from "swr";
import { useCallback } from "react";

export function useCityTransferTaxPercent(): number | undefined {
  const home = useCurrentHome();
  const { data } = useSWR(
    home
      ? `/api/california-city-transfer-tax-rate?city=${home.data()?.city}`
      : null,
    async (url) => {
      const res = await fetch(url);

      const json = await res.json();

      return json.countyTax;
    },
    { revalidateOnMount: false, revalidateOnReconnect: false }
  );

  return data?.cityTax;
}

export function useCountyPropertyTaxPercent(): number | undefined {
  const home = useCurrentHome();

  const { data } = useSWR(
    home
      ? `/api/property-taxes?city=${home.data()?.city}&state=${
          home.data()?.stateAbbreviation
        }`
      : null,
    async (url) => {
      const res = await fetch(url);

      const json = await res.json();

      return json.countyTax;
    }
  );

  return data;
}

export function useCostGenerator(): (baseCost: number) => Cost | undefined {
  const cityTransferTaxPercent = useCityTransferTaxPercent();
  const countyPropertyTaxPercent = useCountyPropertyTaxPercent();

  return useCallback(
    (baseCost: number) => {
      if (!cityTransferTaxPercent || !countyPropertyTaxPercent) {
        return;
      }

      return new Cost({
        baseCost,
        cityTransferTaxPercent,
        countyPropertyTaxPercent,
      });
    },
    [cityTransferTaxPercent, countyPropertyTaxPercent]
  );
}

export function useCost(): Cost | undefined {
  const home = useCurrentHome();
  const costGenerator = useCostGenerator();

  if (!home) {
    return undefined;
  }

  return costGenerator(home.data()?.askingPrice);
}
