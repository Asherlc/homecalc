import { DependencyList, useEffect, useState } from "react";
import "../firebaseConfig";
import * as firebase from "firebase/app";
import { database } from "../database";

import { useAsync } from "react-use";

export type FirestoreRecord<T> = {
  id: string;
  data: T;
};

type Query = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;

export function useFirestoreQuerySnapshot(collectionName: string) {
  const collection = database.collection(collectionName);

  return useAsync<() => Promise<Query | undefined>>(async () => {
    return collection.get();
  });
}

type DocumentSnapshot = firebase.firestore.DocumentSnapshot<
  firebase.firestore.DocumentData
>;

export function useFirestoreDocumentSnapshot(
  collectionName: string,
  id: string | undefined
) {
  return useAsync<() => Promise<DocumentSnapshot | undefined>>(async () => {
    if (id) {
      return database.collection(collectionName).doc(id).get();
    }
  }, [id]);
}

export function useFirestoreCollectionConverter(
  getCollection: () =>
    | firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
    | firebase.firestore.Query<firebase.firestore.DocumentData>
    | undefined,
  Model: any,
  deps: DependencyList | undefined
) {
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

export function useFirestoreDocumentConverter(
  getDocument: () =>
    | firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
    | undefined,
  Model: any,
  deps: DependencyList | undefined
) {
  const document = getDocument();

  const [snapshot, setSnapshot] = useState<any>();

  useEffect(() => {
    return document?.onSnapshot((snapshot) => {
      setSnapshot(snapshot);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, ...(deps || [])]);

  if (snapshot) {
    return new Model(snapshot.id, snapshot.data());
  }
}
