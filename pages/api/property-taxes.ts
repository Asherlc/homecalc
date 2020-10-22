import { NextApiRequest, NextApiResponse } from "next";

import { kebabCase } from "lodash";
import { UsaStates, IStateResult } from "usa-states";

interface SmartAssetPropertyTaxData {
  county: string;
  city: string;
  state: string;
  stateName: string;
  countyTax: number;
  stateTax: number;
  nationalTax: number;
}

async function fetchSmartAssetPropertyTaxes(
  city: string,
  stateAbbreviation: string
): Promise<SmartAssetPropertyTaxData | undefined> {
  const state = new UsaStates().states.find(
    (data: IStateResult) => data.abbreviation === stateAbbreviation
  );

  if (!state) {
    throw new Error();
  }

  const myHeaders = new Headers();
  myHeaders.append(
    "content-type",
    "application/x-www-form-urlencoded; charset=UTF-8"
  );

  const location = encodeURI(`CITY|${city}|${state.abbreviation}`);

  const raw = `ud-current-location=${location}`;

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
  };

  const response = await fetch(
    `https://smartasset.com/taxes/${kebabCase(
      state.name
    )}-property-tax-calculator?render=json&`,
    requestOptions
  );

  const { page_data: taxData } = await response.json();

  if (taxData.city !== city) {
    return undefined;
  }

  return taxData;
}

interface Data {
  countyTax: number;
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Data>
): Promise<void> => {
  const taxData = await fetchSmartAssetPropertyTaxes(
    req.query.city as string,
    req.query.state as string
  );

  if (!taxData) {
    res.statusCode = 404;
    res.end();
    return;
  }

  res.statusCode = 200;
  res.json({ countyTax: taxData.countyTax });
};
