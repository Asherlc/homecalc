import { useRouter } from "next/router";
import { useCurrentHome } from "../hooks/useCurrentHome";

import * as firebase from "firebase";
import { useHomes } from "../hooks/useHomes";

export function HomeSelector() {
  const router = useRouter();
  const currentHome = useCurrentHome();
  const homes = useHomes();

  if (!homes) {
    return null;
  }

  return (
    <div>
      <select
        className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        value={currentHome?.id}
        onChange={(event) => {
          router.push(`/homes/${event.target.value}`);
        }}
      >
        <option></option>
        {homes.map((home) => {
          return (
            <option key={home.id} value={home.id}>
              {home.address}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export const database = firebase.firestore();
