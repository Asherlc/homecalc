import { useFirestoreDocumentConverter } from "./firebase";
import { Home } from "../models/Home";
import { useRouter } from "next/router";
import * as firebase from "firebase";
import { useHomes } from "./useHomes";

export function useCurrentHome(): Home | undefined {
  const homes = useHomes();

  const router = useRouter();
  const homeId = router.query.id;

  if (homes) {
    return homes.find((home) => {
      return home.id === homeId;
    });
  }
}
