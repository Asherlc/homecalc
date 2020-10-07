import { useFirestoreCollectionConverter } from "./firebase";
import { Issue } from "../models/Issue";
import { useCurrentHome } from "./useCurrentHome";
import { Collections, database } from "../database";

export function useIssues(): Issue[] | undefined {
  const home = useCurrentHome();

  return useFirestoreCollectionConverter(
    () => {
      return home?.id
        ? database
            .collection(Collections.Issues)
            .where("homeId", "==", home.id)
            .orderBy("createdAt")
        : undefined;
    },
    Issue,
    [home?.id]
  );
}
