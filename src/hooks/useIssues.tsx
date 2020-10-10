import * as firebase from "firebase/app";
import { useFirestoreCollectionConverter } from "./firebase";
import { Issue } from "../models/Issue";
import { useCurrentHomeCollection } from "./useCurrentHome";
import { Collections } from "../database";

export function useIssues(): {
  issues?: Issue[];
  collection?: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >;
} {
  const collection = useCurrentHomeCollection(Collections.Issues);

  const issues = useFirestoreCollectionConverter(
    () => {
      return collection ? collection.orderBy("createdAt") : undefined;
    },
    Issue,
    [!collection]
  );

  return { issues, collection };
}
