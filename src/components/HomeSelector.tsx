import { useRouter } from "next/router";
import { useCurrentHome } from "../hooks/useCurrentHome";

import * as firebase from "firebase";
import { useHomes } from "../hooks/useHomes";
import { TextInput } from "./TextInputProps";
import { useState } from "react";
import { Button } from "./Button";
import { insertRecord } from "../firebaseUtils";

function HomeCreator() {
  const [address, setAddress] = useState<string>();
  const router = useRouter();

  return (
    <>
      <TextInput
        placeholder="123 Fake St"
        value={address}
        onChange={(value) => {
          setAddress(value);
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
        Create New Home
      </Button>
    </>
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
      <HomeCreator />
    </div>
  );
}

export const database = firebase.firestore();
