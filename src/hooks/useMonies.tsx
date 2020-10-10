import { useAuth } from "../components/Login";
import { Collections, database } from "../database";
import Money from "../models/Money";
import { useFirestoreCollectionConverter } from "./firebase";

export default function useMonies(): Money[] | undefined {
  const { user } = useAuth();

  return useFirestoreCollectionConverter(
    () => {
      if (!user) {
        return;
      }

      return database
        .collection(Collections.Monies)
        .where("uid", "==", user.uid)
        .orderBy("createdAt");
    },
    Money,
    [user]
  );
}
