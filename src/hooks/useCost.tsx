import { useCurrentHome } from "./useCurrentHome";
import { Cost } from "../models/Cost";
import useSWR, { responseInterface } from "swr";
import { useCallback } from "react";
import { RequestError } from "./RequestError";

export function useCityTransferTaxPercent(): number | undefined {
  const home = useCurrentHome();
  const { data } = useSWR(
    home
      ? `/api/california-city-transfer-tax-rate?city=${home.data()?.city}`
      : null,
    async (url) => {
      const res = await fetch(url);

      if (!res.ok) {
        throw new RequestError(res);
      }

      const json = await res.json();

      return json.countyTax;
    },
    { revalidateOnMount: false, revalidateOnReconnect: false }
  );

  return data?.cityTax;
}

export function useCountyPropertyTaxPercent(): responseInterface<
  number,
  unknown
> {
  const home = useCurrentHome();

  return useSWR(
    home
      ? `/api/property-taxes?city=${home.data()?.city}&state=${
          home.data()?.stateAbbreviation
        }`
      : null,
    async (url) => {
      const res = await fetch(url);

      if (!res.ok) {
        throw new RequestError(res);
      }

      const json = await res.json();

      return json.countyTax;
    }
  );
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
      });
    },
    [cityTransferTaxPercent, countyPropertyTaxPercent]
  );
}

export function useCost(): Cost | undefined {
  const home = useCurrentHome();
  const costGenerator = useCostGenerator();
  const homeData = home?.data();

  if (!homeData) {
    return undefined;
  }

  return costGenerator(homeData.askingPrice);
}
