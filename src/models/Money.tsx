import * as firebase from "firebase/app";
import { parseDate } from "chrono-node";
import FirebaseProxy from "./FirebaseProxy";

export interface MoneyData {
  name: string;
  amount: number;
  availableIn: string;
  createdAt: Date;
}

type Snapshot = firebase.firestore.QueryDocumentSnapshot<MoneyData>;

export default class Money implements FirebaseProxy {
  constructor(public data: MoneyData, private snapshot: Snapshot) {}

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

  delete(): Promise<void> {
    return this.snapshot.ref.delete();
  }

  update(vals: firebase.firestore.UpdateData): Promise<void> {
    return this.snapshot.ref.update(vals);
  }

  toJSON(): firebase.firestore.DocumentData {
    return this.data;
  }
}

export const firestoreMoneyConverter: firebase.firestore.FirestoreDataConverter<Money> = {
  toFirestore(money: Money) {
    return money.data;
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot<MoneyData>,
    options: firebase.firestore.SnapshotOptions
  ): Money {
    const data = snapshot.data(options);

    if (!data) {
      throw new Error();
    }

    return new Money(data as MoneyData, snapshot);
  },
};
