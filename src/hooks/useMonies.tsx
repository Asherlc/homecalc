import { Collections, database } from "../database";
import Money from "../models/Money";
import { useFirestoreCollectionConverter } from "./firebase";

export default function useMonies(): Money[] | undefined {
  return useFirestoreCollectionConverter(
    () => {
      return database.collection(Collections.Monies).orderBy("createdAt");
    },
    Money,
    []
  );
}
