import { DependencyList, useEffect, useState } from "react";
import "../firebaseConfig";
import * as firebase from "firebase/app";
import "firebase/firestore";

import { useAsync } from "react-use";
import { firestoreConverter } from "../models/BaseModel";

const database = firebase.firestore();

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

export function useFirestoreCollectionConverter<M>(
  collectionName: string,
  Model: any
) {
  const collection = database.collection(collectionName);

  return useAsync(async () => {
    return (
      await collection.withConverter(firestoreConverter(Model)).get()
    ).docs.map((doc) => {
      return doc.data();
    }) as M[];
  });
}

export function useFirestoreDocumentConverter<M>(
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
      console.log("snapshlt reci");
      setSnapshot(snapshot);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, ...(deps || [])]);

  if (snapshot) {
    return new Model(snapshot.id, snapshot.data());
  }
}
