import * as firebase from "firebase/app";
import { parseDate } from "chrono-node";
import RecordData from "../types/RecordData";
import { BaseModelInterface } from "./BaseModel";

export interface IssueData extends RecordData {
  createdAt: string;
  name: string;
  cost: number;
  requiredIn: string;
  homeId: string;
  sellerPercent: number;
}

export const EmptyIssue = {
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

  get cost(): number {
    return this.data.cost;
  }

  get name(): string {
    return this.data.name;
  }

  get buyerCost(): number {
    return this.cost * (1 - this.sellerPercent);
  }

  get sellerPercent(): number {
    return this.data.sellerPercent;
  }

  get requiredInDate(): Date {
    return parseDate(this.data.requiredIn, new Date(), { forwardDate: true });
  }

  get requiredIn(): string {
    return this.data.requiredIn;
  }
}

export const firestoreIssueConverter: firebase.firestore.FirestoreDataConverter<Issue> = {
  toFirestore() {
    return {};
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): Issue {
    const data = snapshot.data(options)!;

    return new Issue(snapshot.id, data as IssueData);
  },
};
