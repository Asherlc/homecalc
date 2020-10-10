import * as firebase from "firebase/app";
import { Home, firestoreHomeConverter } from "../models/Home";
import { Collections, database } from "../database";
import { useRouter } from "next/router";
import { useFirestoreSnapshot } from "./firebase";

export function useHomes(): Home[] | undefined {
  const {
    query: { workspaceId },
  } = useRouter();

  const ref = workspaceId
    ? database
        .collection(
          `${Collections.Workspaces}/${workspaceId}/${Collections.Homes}`
        )
        .withConverter(firestoreHomeConverter)
    : undefined;

  const snapshot = useFirestoreSnapshot<firebase.firestore.QuerySnapshot<Home>>(
    ref
  );

  return snapshot?.docs.map((doc) => doc.data());
}
