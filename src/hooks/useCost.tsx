import cheerio from "cheerio";
import Tabletojson from "html-table-to-json";
import xmlParser from "fast-xml-parser";
import { useFirestoreCollectionConverter } from "./firebase";
import { Issue } from "../models/Issue";
import { useCurrentHome } from "./useCurrentHome";
import { Cost } from "../models/Cost";
import { Collections, database } from "../database";
import useSWR from "swr";
import useIncomes from "./useIncomes";

interface CityTransferTaxRate {
  city: string;
  rate: number;
}

function useCityTransferTaxPercents() {
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

function useCountyPropertyTaxPercents() {
  return useSWR(
    "https://cors-anywhere.herokuapp.com/https://smartasset.com/taxes/california-property-tax-calculator",
    async (url) => {
      const res = await fetch(url);

      const html = await res.text();
      const $ = cheerio.load(html);
      const table = $('th:contains("Average Effective Property Tax Rate")')
        .closest("table")
        .parent();

      const json = Tabletojson.parse(table.html());

      const formatted = json.results[0].map((row: Record<string, string>) => {
        return {
          county: row.County,
          rate: parseFloat(row["Average Effective Property Tax Rate"]),
        };
      });

      return formatted as { county: string; rate: number }[];
    }
  );
}

export function useCost(): Cost | undefined {
  const home = useCurrentHome();
  const { data: cityTransferTaxPercents } = useCityTransferTaxPercents();
  const { data: countyPropertyTaxPercents } = useCountyPropertyTaxPercents();

  const issues = useIssues();
  const incomes = useIncomes();

  if (
    !home ||
    !issues ||
    !cityTransferTaxPercents ||
    !countyPropertyTaxPercents ||
    !incomes
  ) {
    return;
  }

  const cityTransferTaxPercent = cityTransferTaxPercents.find(({ city }) => {
    return city === home.city;
  })?.rate as number;
  const countyPropertyTaxPercent = countyPropertyTaxPercents.find(
    ({ county }) => {
      return county === home.county;
    }
  )?.rate as number;

  return new Cost({
    incomes,
    issues: issues,
    home: home,
    cityTransferTaxPercent,
    countyPropertyTaxPercent,
  });
}

export function useIssues(): Issue[] | undefined {
  const home = useCurrentHome();

  return useFirestoreCollectionConverter(
    () => {
      return home?.id
        ? database
            .collection(Collections.Issues)
            .where("homeId", "==", home.id)
            .orderBy("createdAt")
        : undefined;
    },
    Issue,
    [home?.id]
  );
}
