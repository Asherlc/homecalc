import { parseDate } from "chrono-node";
import { BaseModelInterface } from "./BaseModel";

export interface MoneyData {
  name: string;
  amount: number;
  availableIn: string;
  createdAt: string;
}

export default class Money implements BaseModelInterface {
  protected data: MoneyData;
  id: string;

  constructor(id: string, data: MoneyData) {
    this.data = data;
    this.id = id;
  }

  get amount(): number {
    return this.data.amount;
  }

  get name(): string {
    return this.data.name;
  }

  get availableInDate(): Date {
    return parseDate(this.data.availableIn, new Date(), { forwardDate: true });
  }

  get availableIn(): string {
    return this.data.availableIn;
  }
}
