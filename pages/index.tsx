import Select from "react-select";
import { formatMoney, unformat as unformatMoney } from "accounting";
import { addYears, eachMonthOfInterval } from "date-fns";
import Chart from "chart.js";
import { add } from "lodash";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import * as firebase from "firebase/app";
import "firebase/database";
import { DEFAULT_COUNT_TAX_RATE, EmptyHome, Home } from "../src/models/Home";
import { EmptyIssue, Issue } from "../src/models/Issue";
import { FirebaseTable, modelFactory } from "../src/models/BaseModel";

export interface IssueData {
  name?: string;
  cost?: number;
  requiredIn?: string;
}

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
export const monthsFromToday = eachMonthOfInterval({
  start: today,
  end: inOneYear,
});

export interface HomeData {
  baseCost?: number;
  countyTaxRate?: number;
  address?: string;
}

class Cost {
  issues: Issue[];
  #home: Home;

  constructor({ issues, home }: { issues: Issue[]; home: Home }) {
    this.issues = issues;
    this.#home = home;
  }

  get totalIssueCost() {
    return this.issues
      .filter((issue) => issue.cost)
      .reduce((total, issue) => {
        return add(total, issue.cost as number);
      }, 0);
  }

  get baseCost(): number {
    return this.#home.baseCost;
  }

  get countyTaxRate() {
    return this.#home.countyTaxRate;
  }

  get total() {
    return add(this.totalIssueCost, this.baseCost);
  }

  get annualTaxes() {
    return Number((this.countyTaxRate / 100) * this.baseCost).toFixed(2);
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

function useFirebase<T>(path: string): T | undefined {
  const [value, setValue] = useState();
  const ref = database.ref(path);

  useEffect(() => {
    ref.on("value", (snapshot) => {
      setValue(snapshot.val());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return value;
}

async function insertRecord<T>(path: string, value: T) {
  database.ref().child(path).push(value);
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

function updateHome(
  key: string,
  attr: string,
  value: string | number | null | undefined
) {
  updateAttribute(`homes/${key}`, attr, value);
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

interface TextInputProps {
  onChange: (val: string | undefined) => void;
  value?: string;
  placeholder?: string;
}

function TextInput({ onChange, ...props }: TextInputProps) {
  return (
    <input
      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
      type="text"
      onChange={(event) => {
        const caret = event.target.selectionStart;
        const element = event.target;
        window.requestAnimationFrame(() => {
          element.selectionStart = caret;
          element.selectionEnd = caret;
        });
        onChange(event.target.value);
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

function PriceInput({
  placeholder,
  onChange,
  value,
}: {
  onChange: (val: number) => void;
  value?: number;
  placeholder?: string;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      value={formatMoney(value || 0)}
      onChange={(newValue) => {
        onChange(unformatMoney(newValue || ""));
      }}
    />
  );
}

function Issues() {
  const cost = useCost();

  if (!cost) {
    return null;
  }

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
          {cost.issues.map((issue) => {
            return (
              <tr key={issue.key}>
                <td className="border px-4 py-2">
                  <TextInput
                    value={issue.name}
                    onChange={(val) => {
                      updateIssue(issue.key, "name", val);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <PriceInput
                    value={issue.cost}
                    onChange={(val) => {
                      updateIssue(issue.key, "cost", val);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <TextInput
                    value={issue.rawRequiredIn}
                    onChange={(val) => {
                      updateIssue(issue.key, "requiredIn", val);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => {
                      removeIssue(issue.key);
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
          insertRecord<IssueData>("issues", EmptyIssue);
        }}
      >
        Add Issue
      </button>
    </>
  );
}

function Summary() {
  const cost = useCost();

  if (!cost) {
    return null;
  }

  return (
    <>
      <p>Total Cost: {cost.total}</p>
      <p>Annual Tax Cost: {cost.annualTaxes}</p>
    </>
  );
}

const CurrentHomeKeyContext = createContext<string | undefined>(undefined);

function useCost() {
  const issuesData = useFirebase<FirebaseTable<IssueData>>("issues");
  const homeKey = useContext(CurrentHomeKeyContext);
  const homeData = useFirebase<HomeData>(`homes/${homeKey}`);
  const home = homeKey && homeData ? new Home(homeKey, homeData) : null;

  if (!home) {
    return null;
  }

  const issues = issuesData
    ? modelFactory<IssueData, Issue>(Issue, issuesData)
    : [];

  return new Cost({
    issues: issues,
    home: home,
  });
}

function TimeChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRenderingContext2D:
    | CanvasRenderingContext2D
    | null
    | undefined = canvasRef.current?.getContext("2d");

  const cost = useCost();

  useEffect(() => {
    if (canvasRenderingContext2D && cost) {
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
          labels: monthsFromToday.map((date) => MONTHS[date.getMonth()]),
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
  }, [canvasRenderingContext2D, cost]);

  return <canvas ref={canvasRef} width="400" height="400"></canvas>;
}

function HomeSelector({
  onChangeCurrentHomeKey,
}: {
  onChangeCurrentHomeKey: (val: string | undefined | null) => void;
}) {
  const homeDatas = useFirebase<FirebaseTable<HomeData>>("homes");
  const homes = homeDatas ? modelFactory<HomeData, Home>(Home, homeDatas) : [];

  return (
    <div>
      <Select
        options={homes.map((home) => {
          return {
            value: home.key,
            label: home.address,
          };
        })}
        onChange={(result: any) => {
          onChangeCurrentHomeKey(result?.value);
        }}
      />
      <button
        onClick={() => {
          insertRecord<HomeData>("homes", EmptyHome);
        }}
      >
        +
      </button>
    </div>
  );
}

function useCurrentHome(): Home | null {
  const currentHomeKey = useContext(CurrentHomeKeyContext);
  const currentHomeData = useFirebase<HomeData>(`/homes/${currentHomeKey}`);

  if (!currentHomeKey || !currentHomeData) {
    return null;
  }

  return new Home(currentHomeKey, currentHomeData);
}

function Basics() {
  const currentHome = useCurrentHome();

  if (!currentHome) {
    return null;
  }

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
          <PriceInput
            placeholder="$800,000"
            value={currentHome?.baseCost}
            onChange={(val) => {
              updateHome(currentHome.key, "baseCost", val);
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
            placeholder={DEFAULT_COUNT_TAX_RATE.toString()}
            value={currentHome.countyTaxRate}
            onChange={(val) => {
              updateHome(currentHome.key, "countyTaxRate", val);
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

export default function HomeComponent() {
  const [currentHomeKey, setCurrentHomeKey] = useState<string>();

  return (
    <CurrentHomeKeyContext.Provider value={currentHomeKey}>
      <div className="w-full h-full flex justify-center bg-gray-200 ">
        <div className="w-full max-w-xl bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <Header />
          <HomeSelector onChangeCurrentHomeKey={setCurrentHomeKey} />
          <Basics />
          <Issues />
          <Summary />
          <TimeChart />
        </div>
      </div>
    </CurrentHomeKeyContext.Provider>
  );
}
