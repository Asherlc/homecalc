import * as firebase from "firebase/app";
import { parseDate } from "chrono-node";
import FirebaseProxy from "./FirebaseProxy";

export interface IssueData {
  createdAt?: Date;
  name?: string;
  cost?: number;
  requiredIn?: string;
  sellerPercent?: number;
}

export const EmptyIssue = {
  cost: 0,
  sellerPercent: 0,
  name: "",
};

type Snapshot = firebase.firestore.QueryDocumentSnapshot<IssueData>;

export class Issue implements FirebaseProxy {
  constructor(public data: IssueData, private snapshot: Snapshot) {}

  delete(): Promise<void> {
    return this.snapshot.ref.delete();
  }

  update(values: firebase.firestore.UpdateData): Promise<void> {
    return this.snapshot.ref.update(values);
  }

  get cost(): number {
    return this.data.cost || 0;
  }

  get name(): string {
    return this.data.name || "";
  }

  get buyerCost(): number {
    return this.cost * (1 - this.sellerPercent);
  }

  get sellerPercent(): number {
    return this.data.sellerPercent || 0;
  }

  get requiredInDate(): Date {
    if (!this.data.requiredIn) {
      return new Date();
    }

    const parsedDate = parseDate(this.data.requiredIn, new Date(), {
      forwardDate: true,
    });

    return parsedDate || new Date();
  }

  get requiredIn(): string | undefined {
    return this.data.requiredIn;
  }

  toJSON(): firebase.firestore.DocumentData {
    return this.data;
  }
}

export const firestoreIssueConverter: firebase.firestore.FirestoreDataConverter<Issue> = {
  toFirestore(issue: Issue) {
    return issue.data;
  },
  fromFirestore(
    snapshot: Snapshot,
    options: firebase.firestore.SnapshotOptions
  ): Issue {
    const data = snapshot.data(options);

    if (!data) {
      throw new Error();
    }

    return new Issue(data as IssueData, snapshot);
  },
};
