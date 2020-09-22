import { useEffect, useState } from "react";
import * as firebase from "firebase/app";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDONcnazlcu-lAWcrC8XPdu0B4grH7benw",
  authDomain: "homecalc-ef45c.firebaseapp.com",
  databaseURL: "https://homecalc-ef45c.firebaseio.com",
  projectId: "homecalc-ef45c",
  storageBucket: "homecalc-ef45c.appspot.com",
  messagingSenderId: "131552060892",
  appId: "1:131552060892:web:b747681044bbb71578db19",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

function useFirebase<T>(
  path: string
):
  | {
      [key: string]: T;
    }
  | undefined {
  const [value, setValue] = useState();
  const ref = database.ref(path);

  useEffect(() => {
    ref.on("value", (snapshot) => {
      setValue(snapshot.val());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}

function insertIssue() {
  const key = database.ref().child("issues").push().key;

  database.ref("issues/" + key).set({
    name: "",
    cost: 0,
  });
}

function removeIssue(key: string) {
  database.ref(`issues/${key}`).remove();
}

interface Issue {
  name: string;
  cost: number;
}

export default function Home() {
  const issues = useFirebase<Issue>("issues") || {};

  return (
    <>
      <button
        onClick={() => {
          insertIssue();
        }}
      >
        Add Issue
      </button>
      {Object.entries(issues).map(([key, issue]) => {
        return (
          <fieldset key={issue.name}>
            <label className="text-gray-700 text-sm font-bold mb-2">
              Issue Name
              <input
                type="text"
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                onChange={(event) => {}}
              />
            </label>
            <label className="text-gray-700 text-sm font-bold mb-2">
              Cost
              <input
                type="number"
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              />
            </label>
            <button
              onClick={() => {
                removeIssue(key);
              }}
            >
              X
            </button>
          </fieldset>
        );
      })}
    </>
  );
}
