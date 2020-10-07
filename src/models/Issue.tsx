import { parseDate } from "chrono-node";
import { BaseModelInterface } from "./BaseModel";

export interface IssueData {
  createdAt?: string;
  name?: string;
  cost?: number;
  requiredIn?: string;
  homeId?: string;
  sellerPercent?: number;
}

export const EmptyIssue: IssueData = {
  cost: 0,
  sellerPercent: 0,
  name: "",
};

export class Issue implements BaseModelInterface {
  protected data: IssueData;
  id: string;

  constructor(id: string, data: IssueData) {
    this.data = data;
    this.id = id;
  }

  get cost() {
    return this.data.cost || 0;
  }

  get name() {
    return this.data.name;
  }

  get buyerCost() {
    return this.cost * (100 - this.sellerPercent);
  }

  get sellerPercent() {
    return this.data.sellerPercent || 0;
  }

  get requiredInDate() {
    if (!this.data.requiredIn) {
      return null;
    }

    return parseDate(this.data.requiredIn, new Date(), { forwardDate: true });
  }

  get requiredIn() {
    return this.data.requiredIn;
  }
}
