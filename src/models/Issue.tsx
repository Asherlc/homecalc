import * as firebase from "firebase/app";
import { parseDate } from "chrono-node";

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

export class Issue {
  data: IssueData;

  constructor(data: IssueData) {
    this.data = data;
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
}

export const firestoreIssueConverter: firebase.firestore.FirestoreDataConverter<Issue> = {
  toFirestore(issue: Issue) {
    return issue.data;
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): Issue {
    const data = snapshot.data(options);

    if (!data) {
      throw new Error();
    }

    return new Issue(data as IssueData);
  },
};
