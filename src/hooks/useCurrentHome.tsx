import * as firebase from "firebase/app";
import { useRouter } from "next/router";
import { Collections, database } from "../database";
import { useFirestoreSnapshot } from "./firebase";
import { useMemo } from "react";
import { firestoreHomeConverter, Home } from "../models/Home";

export function useCurrentHome():
  | firebase.firestore.DocumentSnapshot<Home>
  | undefined {
  const {
    query: { workspaceId, homeId },
  } = useRouter();

  const ref = useMemo(
    () =>
      homeId
        ? database
            .collection(
              `${Collections.Workspaces}/${workspaceId}/${Collections.Homes}`
            )
            .doc(homeId as string)
        : undefined,
    [homeId, workspaceId]
  );

  const snapshot = useFirestoreSnapshot<
    firebase.firestore.DocumentSnapshot<Home>
  >(ref?.withConverter(firestoreHomeConverter));

  return snapshot;
}

export function useCurrentHomeCollection(
  collectionName: Collections
):
  | firebase.firestore.CollectionReference<firebase.firestore.DocumentData>
  | undefined {
  const {
    query: { workspaceId, homeId },
  } = useRouter();

  return useMemo(() => {
    if (!workspaceId || !homeId) {
      return undefined;
    }

    return database.collection(
      `${Collections.Workspaces}/${workspaceId}/${Collections.Homes}/${homeId}/${collectionName}`
    );
  }, [collectionName, homeId, workspaceId]);
}
