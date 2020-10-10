import * as firebase from "firebase/app";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { Collections, database } from "../database";
import Money, { firestoreMoneyConverter } from "../models/Money";
import { useFirestoreSnapshot } from "./firebase";

export default function useMonies():
  | firebase.firestore.QuerySnapshot<Money>
  | undefined {
  const collection = useMoniesCollection();

  const queryRef = useMemo(
    () =>
      collection?.orderBy("createdAt").withConverter(firestoreMoneyConverter),
    [collection]
  );

  return useFirestoreSnapshot<firebase.firestore.QuerySnapshot<Money>>(
    queryRef
  );
}

export function useMoniesCollection():
  | firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
  | undefined {
  const {
    query: { workspaceId },
  } = useRouter();

  return useMemo(
    () =>
      workspaceId
        ? database.collection(
            `${Collections.Workspaces}/${workspaceId}/${Collections.Monies}`
          )
        : undefined,
    [workspaceId]
  );
}
