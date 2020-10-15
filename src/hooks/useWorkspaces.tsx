import * as firebase from "firebase/app";
import Workspace, { firestoreWorkspaceConverter } from "../models/Workspace";
import { Collections, database } from "../database";
import { useAuth } from "../components/Login";
import { useFirestoreSnapshot } from "./firebase";
import { useMemo } from "react";

export default function useWorkSpaces(): {
  workspaces?: firebase.firestore.QuerySnapshot<Workspace>;
  collection?: firebase.firestore.CollectionReference<
    firebase.firestore.DocumentData
  >;
} {
  const { user } = useAuth();
  const collection = useMemo(
    () => database.collection(Collections.Workspaces),
    []
  );

  const queryRef = useMemo(() => {
    if (!user) {
      return;
    }

    return collection
      .where("owners", "!=", false)
      .where("owners", "array-contains", user.email?.toLowerCase())
      .withConverter(firestoreWorkspaceConverter);
  }, [collection, user]);

  const snapshot = useFirestoreSnapshot<
    firebase.firestore.QuerySnapshot<Workspace>
  >(queryRef);

  return { workspaces: snapshot, collection };
}
