import { useFirestoreCollectionConverter } from "./firebase";
import { Home } from "../models/Home";
import { Collections, database } from "../database";
import { useAuth } from "../components/Login";

export function useHomes(): Home[] | undefined {
  const { user } = useAuth();

  return useFirestoreCollectionConverter(
    () => {
      if (!user) {
        return;
      }

      return database
        .collection(Collections.Homes)
        .where("uid", "==", user.uid);
    },
    Home,
    [user?.uid]
  ) as Home[] | undefined;
}
