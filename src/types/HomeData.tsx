import RecordData from "./RecordData";
import UserScoped from "./UserScoped";

export interface HomeData extends UserScoped, RecordData {
  baseCost?: number;
  address: string;
  city: string;
  county: string;
}
