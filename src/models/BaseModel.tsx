import * as firebase from "firebase";

export interface BaseModelInterface {
  id: string;

  toFirestore(): Record<string, any>;
}

export interface BaseModelConstructor<
  T = Record<string, any>,
  C = BaseModelInterface
> {
  new (id: string, data: T): C;
}

export function firestoreConverter(Constructor: any) {
  return {
    toFirestore(model: BaseModelInterface) {
      return model.toFirestore();
    },
    fromFirestore(
      snapshot: firebase.firestore.QueryDocumentSnapshot,
      options: firebase.firestore.SnapshotOptions
    ) {
      return new Constructor(snapshot.id, snapshot.data());
    },
  };
}
