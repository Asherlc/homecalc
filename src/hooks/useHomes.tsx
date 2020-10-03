import { useFirestoreCollectionConverter } from "./firebase";
import { Home } from "../models/Home";
import { database } from "../components/HomeSelector";

export function useHomes() {
  return useFirestoreCollectionConverter(
    () => {
      return database.collection("homes");
    },
    Home,
    []
  ) as Home[] | undefined;
}
