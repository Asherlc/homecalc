import { useRouter } from "next/router";
import { useCurrentHome } from "../hooks/useCurrentHome";

import * as firebase from "firebase";
import { useHomes } from "../hooks/useHomes";
import { TextInput, PriceInput } from "./inputs";
import { useState } from "react";
import { Button } from "./Button";
import { insertRecord } from "../firebaseUtils";

function HomeCreator() {
  const [address, setAddress] = useState<string>();
  const router = useRouter();

  return (
    <div className="flex items-center border-b border-teal-500 py-2">
      <TextInput
        placeholder="123 Fake St"
        value={address}
        onChange={(value) => {
          setAddress(value?.toString());
        }}
      />
      <Button
        onClick={async () => {
          const id = await insertRecord("homes", {
            address,
          });

          router.push(`/homes/${id}`);

          setAddress("");
        }}
      >
        New Home
      </Button>
    </div>
  );
}

export function HomeSelector() {
  const router = useRouter();
  const currentHome = useCurrentHome();
  const homes = useHomes();

  if (!homes) {
    return null;
  }

  return (
    <div className="w-full px-3 mb-6 md:mb-0">
      <div className="relative">
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
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      <HomeCreator />
    </div>
  );
}

export const database = firebase.firestore();
