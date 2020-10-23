import { useCurrentHome } from "./useCurrentHome";
import useSWR, { responseInterface } from "swr";
import { RequestError } from "./RequestError";

export function useCityTransferTaxPercent(): responseInterface<
  number,
  unknown
> {
  const home = useCurrentHome();
  return useSWR(
    home
      ? `/api/california-city-transfer-tax-rate?city=${home.data()?.city}`
      : null,
    async (url) => {
      const res = await fetch(url);

      if (!res.ok) {
        throw new RequestError(res);
      }

      const json = await res.json();

      return json.cityTax;
    },
    {
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    }
  );
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
    },
    {
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
    }
  );
}
