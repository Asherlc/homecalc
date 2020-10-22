import * as firebase from "firebase/app";

export interface HomeData {
  baseCost?: number;
  address: string;
  city: string;
  stateAbbreviation: string;
  createdAt: Date;
}

export const EmptyHome = {
  address: "",
  city: "",
  stateAbbreviation: "",
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

  get stateAbbreviation(): string {
    return this.data.stateAbbreviation;
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
