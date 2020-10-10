import RecordData from "./RecordData";

export interface HomeData extends RecordData {
  baseCost?: number;
  address: string;
  city: string;
  county: string;
}
