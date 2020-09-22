import { add } from "lodash";
import {
  DetailedHTMLProps,
  InputHTMLAttributes,
  useEffect,
  useState,
} from "react";
import * as firebase from "firebase/app";
import "firebase/database";

interface HomeData {
  baseCost: number;
  countyTaxRate: number;
}

interface Issue {
  name: string;
  cost: number;
}

class Cost {
  #issues: Issue[];
  #home: HomeData;

  constructor({ issues, home }: { issues: Issue[]; home: HomeData }) {
    this.#issues = issues;
    this.#home = home;
  }

  get totalIssueCost() {
    return this.#issues.reduce((total, issue) => {
      return total + issue.cost;
    }, 0);
  }

  get total() {
    return add(this.totalIssueCost, this.#home.baseCost);
  }

  get annualTaxes() {
    return Number(
      (this.#home.countyTaxRate / 100) * this.#home.baseCost
    ).toFixed(2);
  }
}

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

type SetAttribute = (attribute: string, value: string | number | null) => void;

function useFirebase<T>(path: string): [T | undefined, SetAttribute] {
  const [value, setValue] = useState();
  const ref = database.ref(path);

  useEffect(() => {
    ref.on("value", (snapshot) => {
      setValue(snapshot.val());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setAttribute(attribute: string, newValue: string | number | null) {
    ref.transaction((object) => {
      const nonNullObject = object || {};
      nonNullObject[attribute] = newValue;

      return nonNullObject;
    });
  }

  return [value, setAttribute];
}

function insertIssue() {
  const key = database.ref().child("issues").push().key;

  database.ref("issues/" + key).set({
    name: "",
    cost: 0,
  });
}

function updateAttribute(
  path: string,
  attr: string,
  value: string | number | null
) {
  database.ref(path).transaction((object) => {
    object[attr] = value;

    return object;
  });
}

function updateIssue(key: string, attr: string, value: string | number | null) {
  updateAttribute(`issues/${key}`, attr, value);
}

function removeIssue(key: string) {
  database.ref(`issues/${key}`).remove();
}

function TextInput(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) {
  return (
    <input
      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
      type="text"
      {...props}
    />
  );
}

interface NumberInputProps {
  value?: number;
  placeholder?: string;
  onChange: (val: number | null) => void;
}

function NumberInput({ onChange, ...props }: NumberInputProps) {
  return (
    <input
      type="number"
      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
      onChange={(event) => {
        const val = event.target.value;
        const parsedVal = val ? parseFloat(val) : null;

        onChange(parsedVal);
      }}
      {...props}
    />
  );
}

function Issues() {
  const [issues] = useFirebase<{ [key: string]: Issue }>("issues");

  return (
    <>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Issue</th>
            <th className="px-4 py-2">Cost</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(issues || {}).map(([key, issue]) => {
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
                    onChange={(val: number | null) => {
                      updateIssue(key, "cost", val);
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
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          insertIssue();
        }}
      >
        Add Issue
      </button>
    </>
  );
}

function Summary() {
  const [issues] = useFirebase<Issue>("issues");
  const [home] = useFirebase<HomeData>("home");

  const cost = new Cost({
    issues: Object.values(issues || {}),
    home: home || {
      baseCost: 0,
      countyTaxRate: 0,
    },
  });

  return (
    <>
      <p>Total Cost: {cost.total}</p>
      <p>Annual Tax Cost: {cost.annualTaxes}</p>
    </>
  );
}

function Basics() {
  const [basics, setAttribute] = useFirebase<HomeData>("home");

  return (
    <form className="w-full max-w-lg">
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-first-name"
          >
            Base Price
          </label>
          <NumberInput
            placeholder="800000"
            value={basics?.baseCost}
            onChange={(val: number | null) => {
              setAttribute("baseCost", val);
            }}
          />
        </div>
        <div className="w-full md:w-1/2 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-last-name"
          >
            County Tax Rate (%)
          </label>
          <NumberInput
            placeholder={"0.785"}
            value={basics?.countyTaxRate}
            onChange={(val) => {
              setAttribute("countyTaxRate", val);
            }}
          />
        </div>
      </div>
    </form>
  );
}

function Header() {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">
          Home Cost Calculator
        </span>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <div className="w-full h-full flex justify-center bg-gray-200 ">
      <div className="w-full max-w-xl bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <Header />
        <Basics />
        <Issues />
        <Summary />
      </div>
    </div>
  );
}
