import * as firebase from "firebase/app";
import { parseDate } from "chrono-node";

export interface MoneyData {
  name: string;
  amount: number;
  availableIn: string;
  createdAt: Date;
}

export default class Money {
  data: MoneyData;

  constructor(data: MoneyData) {
    this.data = data;
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

export const firestoreMoneyConverter: firebase.firestore.FirestoreDataConverter<Money> = {
  toFirestore(money: Money) {
    return money.data;
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): Money {
    const data = snapshot.data(options)!;

    return new Money(data as MoneyData);
  },
};
