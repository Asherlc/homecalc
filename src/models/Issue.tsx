import { parseDate } from "chrono-node";
import { isSameMonth } from "date-fns";
import { IssueData, monthsFromToday } from "../../src/components/Home";
import { BaseModelInterface } from "./BaseModel";

export const EmptyIssue: IssueData = {
  cost: 0,
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
    return this.data.cost;
  }

  get name() {
    return this.data.name;
  }

  get requiredIn() {
    if (!this.data.requiredIn) {
      return null;
    }

    return parseDate(this.data.requiredIn);
  }

  get rawRequiredIn() {
    return this.data.requiredIn;
  }

  get costPerMonth() {
    return monthsFromToday.map((date) => {
      if (this.requiredIn && isSameMonth(this.requiredIn, date)) {
        return this.data.cost || 0;
      }

      return 0;
    });
  }

  get valid() {
    return this.cost && this.name;
  }

  toFirestore() {
    return this.data;
  }
}
