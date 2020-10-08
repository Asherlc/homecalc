import { Home } from "../models/Home";
import { useRouter } from "next/router";
import { useHomes } from "./useHomes";
import { useMemo } from "react";

export function useCurrentHome(): Home | undefined {
  const homes = useHomes();
  const router = useRouter();
  const homeId = router.query.id;

  return useMemo(() => {
    if (homes) {
      return homes.find((home) => {
        return home.id === homeId;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(homes), homeId]);
}
