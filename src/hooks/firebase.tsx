import { useState } from "react";
import "../firebaseConfig";
import * as firebase from "firebase/app";
import { useCustomCompareEffect } from "react-use";
import handleException from "../handleException";

export type FirestoreRecord<T> = {
  id: string;
  data: T;
};

type Snapshot =
  | firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
  | firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>;

interface Snapshottable {
  onSnapshot(
    onNext: (snapshot: Snapshot) => void,
    onError: (error: firebase.firestore.FirestoreError) => void
  ): () => void;
  isEqual: (arg: any) => boolean;
}

export function useFirestoreSnapshot<T extends Snapshot>(
  ref: Snapshottable | undefined
): T | undefined {
  const [snapshot, setSnapshot] = useState<T | undefined>();

  useCustomCompareEffect(
    () => {
      return ref?.onSnapshot(
        (snapshot) => {
          setSnapshot((snapshot as unknown) as T);
        },
        (error) => {
          handleException(error);
        }
      );
    },
    [ref],
    ([prevRef], [nextRef]) => {
      if (prevRef === nextRef) {
        return true;
      }

      return nextRef ? prevRef?.isEqual(nextRef) ?? false : false;
    }
  );

  return snapshot;
}
