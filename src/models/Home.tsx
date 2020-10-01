import { HomeData } from "../../pages/index";
import BaseModel from "./BaseModel";

export const DEFAULT_COUNT_TAX_RATE = 0.785;

export const EmptyHome: HomeData = {
  address: "123 Fake St",
  baseCost: 0,
  countyTaxRate: DEFAULT_COUNT_TAX_RATE,
};

export class Home extends BaseModel<HomeData> {
  get baseCost(): number {
    return this.data.baseCost || 0;
  }

  get address() {
    return this.data.address;
  }

  get countyTaxRate() {
    return this.data.countyTaxRate || 0.785;
  }
}
