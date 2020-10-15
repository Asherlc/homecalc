import * as firebase from "firebase/app";
import { HomeData } from "../types/HomeData";

export const EmptyHome = {
  address: "",
  city: "",
  county: "",
  baseCost: 0,
};

export class Home {
  data: HomeData;

  constructor(data: HomeData) {
    this.data = data;
  }

  get askingPrice(): number {
    return this.data.baseCost || 0;
  }

  get county(): string {
    return this.data.county;
  }

  get address(): string {
    return this.data.address;
  }

  get city(): string {
    return this.data.city;
  }
}

export const firestoreHomeConverter: firebase.firestore.FirestoreDataConverter<Home> = {
  toFirestore(home: Home) {
    return home.data;
  },
  fromFirestore(
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions
  ): Home {
    const data = snapshot.data(options)!;

    return new Home(data as HomeData);
  },
};
