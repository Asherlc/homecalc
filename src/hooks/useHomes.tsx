import { useFirestoreCollectionConverter } from "./firebase";
import { Home } from "../models/Home";
import { Collections, database } from "../database";

export function useHomes(): Home[] | undefined {
  return useFirestoreCollectionConverter(
    () => {
      return database.collection(Collections.Homes);
    },
    Home,
    []
  ) as Home[] | undefined;
}
