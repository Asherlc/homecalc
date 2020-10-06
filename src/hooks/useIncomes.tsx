import { Collections, database } from "../database";
import Income from "../models/Income";
import { useFirestoreCollectionConverter } from "./firebase";

export default function useIncomes(): Income[] | undefined {
  return useFirestoreCollectionConverter(
    () => {
      return database.collection(Collections.Incomes).orderBy("createdAt");
    },
    Income,
    []
  );
}
