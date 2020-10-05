import { useFirestoreCollectionConverter } from "./firebase";
import { Home } from "../models/Home";
import { database } from "../database";

export function useHomes() {
  return useFirestoreCollectionConverter(
    () => {
      return database.collection("homes");
    },
    Home,
    []
  ) as Home[] | undefined;
}
