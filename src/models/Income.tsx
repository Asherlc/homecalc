import { parseDate } from "chrono-node";
import { BaseModelInterface } from "./BaseModel";

export interface IncomeData {
  name: string;
  amount: number;
  availableIn: string;
  createdAt: string;
}

export default class Income implements BaseModelInterface {
  protected data: IncomeData;
  id: string;

  constructor(id: string, data: IncomeData) {
    this.data = data;
    this.id = id;
  }

  get amount() {
    return this.data.amount;
  }

  get name() {
    return this.data.name;
  }

  get availableInDate() {
    if (!this.data.availableIn) {
      return null;
    }

    return parseDate(this.data.availableIn, new Date(), { forwardDate: true });
  }

  get availableIn() {
    return this.data.availableIn;
  }
}
