import * as firebase from "firebase/app";

export interface HomeData {
  address: string;
  city: string;
  stateAbbreviation: string;
  createdAt: Date;
}

export const EmptyHome = {
  address: "",
  city: "",
  stateAbbreviation: "",
};

export class Home {
  data: HomeData;

  constructor(data: HomeData) {
    this.data = data;
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
    const data = snapshot.data(options);

    if (!data) {
      throw new Error();
    }

    return new Home(data as HomeData);
  },
};
