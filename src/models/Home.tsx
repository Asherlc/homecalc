import { HomeData } from "../types/HomeData";
import { BaseModelInterface } from "./BaseModel";

export const DEFAULT_COUNT_TAX_RATE = 0.785;

export const EmptyHome: HomeData = {
  address: "123 Fake St",
  baseCost: 0,
  countyTaxRate: DEFAULT_COUNT_TAX_RATE,
};

export class Home implements BaseModelInterface {
  protected data: HomeData;
  id: string;

  constructor(id: string, data: HomeData) {
    this.data = data;
    this.id = id;
  }

  toFirestore(): Record<string, any> {
    return this.data;
  }

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
