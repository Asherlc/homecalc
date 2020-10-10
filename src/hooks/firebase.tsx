import { DependencyList, useEffect, useMemo, useState } from "react";
import "../firebaseConfig";
import * as firebase from "firebase/app";

export type FirestoreRecord<T> = {
  id: string;
  data: T;
};

export function useFirestoreCollectionConverter(
  getCollection: () =>
    | firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
    | firebase.firestore.Query<firebase.firestore.DocumentData>
    | undefined,
  Model: any,
  deps: DependencyList | undefined
): any[] | undefined {
  const [snapshot, setSnapshot] = useState<
    | firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
    | undefined
  >();

  useEffect(() => {
    const collection = getCollection();

    return collection?.onSnapshot((snapshot) => {
      setSnapshot(snapshot);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  if (snapshot) {
    const models: typeof Model[] = [];

    snapshot.forEach((doc) => {
      models.push(new Model(doc.id, doc.data()));
    });

    return models;
  }
}
