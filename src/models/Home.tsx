import { HomeData } from "../types/HomeData";
import { BaseModelInterface } from "./BaseModel";

export const EmptyHome: HomeData = {
  address: "",
  city: "",
  county: "",
  baseCost: 0,
};

export class Home implements BaseModelInterface {
  protected data: HomeData;
  id: string;

  constructor(id: string, data: HomeData) {
    this.data = data;
    this.id = id;
  }

  get baseCost(): number {
    return this.data.baseCost || 0;
  }

  get county() {
    return this.data.county;
  }

  get address() {
    return this.data.address;
  }

  get city() {
    return this.data.city;
  }
}
