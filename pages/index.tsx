import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useEffect,
  useState,
} from "react";
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

function updateIssue(key: string, attr: string, value: string | number) {
  console.log(key, attr, value);
  database.ref("issues/" + key).transaction((issue) => {
    issue[attr] = value;

    return issue;
  });
}

function removeIssue(key: string) {
  database.ref(`issues/${key}`).remove();
}

interface Issue {
  name: string;
  cost: number;
}

function TextInput(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) {
  return (
    <input
      className="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4"
      type="text"
      {...props}
    />
  );
}

function NumberInput(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) {
  return (
    <input
      type="number"
      className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700  outline-none"
      {...props}
    ></input>
  );
}

function Issues() {
  const issues = useFirebase<Issue>("issues") || {};

  return (
    <>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          insertIssue();
        }}
      >
        Add Issue
      </button>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Issue</th>
            <th className="px-4 py-2">Cost</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(issues).map(([key, issue]) => {
            return (
              <tr key={key}>
                <td className="border px-4 py-2">
                  <TextInput
                    value={issue.name}
                    onChange={(event) => {
                      updateIssue(key, "name", event.target.value);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <NumberInput
                    value={issue.cost}
                    onChange={(event) => {
                      updateIssue(
                        key,
                        "cost",
                        event.target.value ? parseInt(event.target.value) : 0
                      );
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => {
                      removeIssue(key);
                    }}
                  >
                    X
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

class Cost {
  #issues: Issue[];

  constructor({ issues }: { issues: Issue[] }) {
    this.#issues = issues;
  }

  get total() {
    return this.#issues.reduce((total, issue) => {
      return total + issue.cost;
    }, 0);
  }
}

function Summary() {
  const issues = useFirebase<Issue>("issues") || {};

  const cost = new Cost({
    issues: Object.values(issues),
  });

  return <>Total Cost: {cost.total}</>;
}

export default function Home() {
  return (
    <>
      <Issues />
      <Summary />
    </>
  );
}
