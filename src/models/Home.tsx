import { HomeData } from "../types/HomeData";
import { BaseModelInterface } from "./BaseModel";

export const EmptyHome = {
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

  get askingPrice(): number {
    return this.data.baseCost || 0;
  }

  get county(): string {
    return this.data.county;
  }

  get address(): string {
    return this.data.address;
  }

  get city(): string {
    return this.data.city;
  }

  get uid(): string {
    return this.data.uid;
  }
}
