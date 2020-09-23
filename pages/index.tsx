import * as chrono from "chrono-node";
import { addYears, eachMonthOfInterval } from "date-fns";
import Chart from "chart.js";
import { add } from "lodash";
import { useEffect, useRef, useState } from "react";
import * as firebase from "firebase/app";
import "firebase/database";

const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const today = new Date();
const inOneYear = addYears(today, 1);
const monthsFromToday = eachMonthOfInterval({
  start: today,
  end: inOneYear,
});

interface HomeData {
  baseCost: number;
  countyTaxRate: number;
}

interface IssueData {
  name?: string;
  cost?: number;
  requiredIn?: string;
}

class Issue {
  #data: IssueData;

  constructor(data: IssueData) {
    this.#data = data;
  }

  get cost() {
    return this.#data.cost;
  }

  get name() {
    return this.#data.name;
  }

  get requiredInMonth() {
    if (!this.#data.requiredIn) {
      return null;
    }

    const requiredInDate = chrono.parseDate(this.#data.requiredIn);

    if (!requiredInDate) {
      return null;
    }

    return requiredInDate.getMonth();
  }

  get costPerMonth() {
    return monthsFromToday.map((date) => {
      const monthIndex = date.getMonth();

      if (this.requiredInMonth === monthIndex) {
        return this.#data.cost || 0;
      }

      return 0;
    });
  }

  get valid() {
    return this.cost && this.name;
  }
}

class Cost {
  issues: Issue[];
  #home: HomeData;

  constructor({ issues, home }: { issues: IssueData[]; home: HomeData }) {
    this.issues = issues.map((data) => new Issue(data));
    this.#home = home;
  }

  get totalIssueCost() {
    return this.issues
      .filter((issue) => issue.cost)
      .reduce((total, issue) => {
        return add(total, issue.cost as number);
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

  get issuesGroupedByMonth() {
    return monthsFromToday.map((date) => {
      const monthIndex = date.getMonth();

      return this.issues.filter(
        (issue) => issue.requiredInMonth === monthIndex && issue.cost
      );
    });
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
  value: string | number | null | undefined
) {
  database.ref(path).transaction((object) => {
    object[attr] = value;

    return object;
  });
}

function updateIssue(
  key: string,
  attr: string,
  value: string | number | null | undefined
) {
  updateAttribute(`issues/${key}`, attr, value);
}

function removeIssue(key: string) {
  database.ref(`issues/${key}`).remove();
}

function TextInput({
  onChange,
  ...props
}: {
  onChange: (val: string | undefined) => void;
  value?: string;
  placeholder?: string;
}) {
  return (
    <input
      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
      type="text"
      onChange={(e) => {
        onChange(e.target.value);
      }}
      {...props}
    />
  );
}

interface NumberInputProps {
  value?: number;
  placeholder?: string;
  onChange: (val: number | null) => void;
}

function NumberInput({ onChange, value, ...props }: NumberInputProps) {
  return (
    <input
      type="number"
      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
      onChange={(event) => {
        const val = event.target.value;
        const parsedVal = val ? parseFloat(val) : null;

        onChange(parsedVal);
      }}
      value={value || ""}
      {...props}
    />
  );
}

function Issues() {
  const [issues] = useFirebase<{ [key: string]: IssueData }>("issues");

  return (
    <>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Issue</th>
            <th className="px-4 py-2">Cost</th>
            <th className="px-4 py-2">Required In</th>
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
                    onChange={(val) => {
                      updateIssue(key, "name", val);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <NumberInput
                    value={issue.cost}
                    onChange={(val) => {
                      updateIssue(key, "cost", val);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <TextInput
                    value={issue.requiredIn}
                    onChange={(val) => {
                      updateIssue(key, "requiredIn", val);
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
  const cost = useCost();

  return (
    <>
      <p>Total Cost: {cost.total}</p>
      <p>Annual Tax Cost: {cost.annualTaxes}</p>
    </>
  );
}

function useCost() {
  const [issues] = useFirebase<IssueData>("issues");
  const [home] = useFirebase<HomeData>("home");

  const cost = new Cost({
    issues: Object.values(issues || {}),
    home: home || {
      baseCost: 0,
      countyTaxRate: 0,
    },
  });

  return cost;
}

function TimeChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRenderingContext2D:
    | CanvasRenderingContext2D
    | null
    | undefined = canvasRef.current?.getContext("2d");

  const cost = useCost();

  useEffect(() => {
    if (canvasRenderingContext2D) {
      // eslint-disable-next-line no-new
      new Chart(canvasRenderingContext2D, {
        type: "bar",
        options: {
          scales: {
            yAxes: [
              {
                stacked: true,
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
        data: {
          labels: cost.issuesGroupedByMonth.map(
            (cost, index) => MONTHS[index % MONTHS.length]
          ),
          datasets: cost.issues
            .filter((issue) => issue.valid)
            .map((issue, index) => {
              return {
                backgroundColor: Object.values(CHART_COLORS)[index],
                label: issue.name,
                data: issue.costPerMonth,
              };
            }),
        },
      });
    }
  }, [canvasRenderingContext2D, cost.issues, cost.issuesGroupedByMonth]);

  return <canvas ref={canvasRef} width="400" height="400"></canvas>;
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
            onChange={(val) => {
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
        <TimeChart />
      </div>
    </div>
  );
}
