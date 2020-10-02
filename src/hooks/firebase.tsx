import { DependencyList } from "react";
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

  return useAsync<() => Promise<M | undefined>>(async () => {
    return document
      ? ((await (
          await document.withConverter(firestoreConverter(Model)).get()
        ).data()) as M)
      : undefined;
  }, deps);
}
