import xmlParser from "fast-xml-parser";
import { useFirestoreCollectionConverter } from "./firebase";
import { Issue } from "../models/Issue";
import { useCurrentHome } from "./useCurrentHome";
import { Cost } from "../models/Cost";
import { database } from "../database";
import useSWR from "swr";

interface CityTransferTaxRate {
  city: string;
  rate: number;
}

function useCityTransferTaxRates() {
  return useSWR(
    "https://cors-anywhere.herokuapp.com/https://www.vivaescrow.com/taxrates.xml",
    async (url) => {
      const res = await fetch(url);

      const xmlData = await res.text();

      const json = xmlParser.parse(xmlData, {
        ignoreAttributes: false,
        attributeNamePrefix: "",
      }).CityTaxRates.City;

      return json.map((obj: { city: string; rate: string }) => {
        return {
          city: obj.city,
          rate: parseFloat(obj.rate),
        };
      }) as CityTransferTaxRate[];
    }
  );
}

export function useCost() {
  const home = useCurrentHome();
  const { data: cityTransferTaxRates } = useCityTransferTaxRates();

  const issues = useFirestoreCollectionConverter(
    () => {
      return home?.id
        ? database
            .collection("issues")
            .where("homeId", "==", home.id)
            .orderBy("createdAt")
        : undefined;
    },
    Issue,
    [home?.id]
  );

  if (!home || !issues || !cityTransferTaxRates) {
    return null;
  }

  const cityTransferTaxPercent = cityTransferTaxRates.find(({ city }) => {
    return city === home.city;
  })?.rate as number;

  return new Cost({
    issues: issues,
    home: home,
    cityTransferTaxPercent,
  });
}
