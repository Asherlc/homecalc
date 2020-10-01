import "../firebaseConfig";
import * as firebase from "firebase/app";
import "firebase/firestore";

import { useEffect, useState } from "react";

const database = firebase.firestore();

export type FirestoreRecord<T> = {
  id: string;
  data: T;
};

export function useFirestoreCollection<T>(
  collectionName: string
): FirestoreRecord<T>[] {
  const [value, setValue] = useState<FirestoreRecord<T>[]>([]);
  const collection = database.collection(collectionName);

  useEffect(() => {
    return collection.onSnapshot((collection) => {
      const docs: FirestoreRecord<T>[] = [];

      collection.forEach((doc) => {
        docs.push({
          id: doc.id,
          data: doc.data() as T,
        });
      });
      setValue(docs);
    });
  }, [collection]);

  return value;
}

export function useFirestoreDocument<T extends firebase.firestore.DocumentData>(
  collectionName: string,
  id: string | undefined
): T | undefined {
  const [value, setValue] = useState<T>();
  let doc: firebase.firestore.DocumentReference<
    firebase.firestore.DocumentData
  > | null = null;

  if (id) {
    doc = database.collection(collectionName).doc(id);
  }

  useEffect(() => {
    if (!doc) {
      return undefined;
    }

    return doc.onSnapshot((snapshot) => {
      setValue(snapshot.data() as T);
    });
  }, [doc]);

  return value;
}
