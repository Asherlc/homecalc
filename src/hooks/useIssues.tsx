import * as firebase from "firebase/app";
import { useFirestoreSnapshot } from "./firebase";
import { firestoreIssueConverter, Issue } from "../models/Issue";
import { useCurrentHomeCollection } from "./useCurrentHome";
import { Collections } from "../database";
import { useMemo } from "react";

export function useIssuesCollection():
  | firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
  | undefined {
  return useCurrentHomeCollection(Collections.Issues);
}

export function useIssues():
  | firebase.firestore.QuerySnapshot<Issue>
  | undefined {
  const collection = useIssuesCollection();
  const queryRef = useMemo(
    () =>
      collection
        ? collection.orderBy("createdAt").withConverter(firestoreIssueConverter)
        : undefined,
    [collection]
  );

  return useFirestoreSnapshot<firebase.firestore.QuerySnapshot<Issue>>(
    queryRef
  );
}
