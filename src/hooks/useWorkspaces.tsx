import * as firebase from "firebase/app";
import Workspace, { firestoreWorkspaceConverter } from "../models/Workspace";
import { Collections, database } from "../database";
import { useAuth } from "../components/Login";
import { useFirestoreSnapshot } from "./firebase";
import { useMemo } from "react";

export default function useWorkSpaces(): {
  workspaces?: Workspace[];
  collection?: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >;
} {
  const { user } = useAuth();
  const collection = useMemo(
    () => database.collection(Collections.Workspaces),
    []
  );

  const queryRef = useMemo(
    () =>
      user
        ? collection
            .where("uid", "==", user.uid)
            .withConverter(firestoreWorkspaceConverter)
        : undefined,
    [collection, user]
  );

  const snapshot = useFirestoreSnapshot<
    firebase.firestore.QuerySnapshot<Workspace>
  >(queryRef);

  return { workspaces: snapshot?.docs.map((doc) => doc.data()), collection };
}
