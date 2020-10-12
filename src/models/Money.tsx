import * as firebase from "firebase/app";
import { parseDate } from "chrono-node";
import RecordData from "../types/RecordData";
import { BaseModelInterface } from "./BaseModel";

export interface MoneyData extends RecordData {
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

  get uid(): string {
    return this.data.uid;
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
  toFirestore() {
    return {};
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): Money {
    const data = snapshot.data(options)!;

    return new Money(snapshot.id, data as MoneyData);
  },
};
