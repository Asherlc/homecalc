import xmlParser from "fast-xml-parser";
import { NextApiRequest, NextApiResponse } from "next";
import { RequestError } from "../../src/hooks/RequestError";

interface CityTransferTaxRate {
  city: string;
  rate: number;
}

async function fetchCityTransferTaxRates(city: string) {
  const res = await fetch(`https://www.vivaescrow.com/taxrates.xml`);

  if (!res.ok) {
    throw new RequestError(res);
  }

  const xmlData = await res.text();

  const json = xmlParser.parse(xmlData, {
    ignoreAttributes: false,
    attributeNamePrefix: "",
  }).CityTaxRates.City;

  const rates = json.map((obj: { city: string; rate: string }) => {
    return {
      city: obj.city,
      rate: parseFloat(obj.rate) / 100,
    };
  }) as CityTransferTaxRate[];

  const matchedRate = rates.find((obj) => obj.city === city);

  return matchedRate?.rate;
}

interface Data {
  cityTax: number;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
): Promise<void> => {
  const cityTax = await fetchCityTransferTaxRates(req.query.city as string);

  if (!cityTax) {
    res.statusCode = 404;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.json({ cityTax });
};
