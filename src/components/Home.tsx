import "../firebaseConfig";
import {
  useFirestoreCollectionConverter,
  useFirestoreDocumentSnapshot,
  useFirestoreDocumentConverter,
} from "../hooks/firebase";
import Creatable from "react-select/creatable";
import { formatMoney, unformat as unformatMoney } from "accounting";
import { addYears, eachMonthOfInterval } from "date-fns";
import Chart from "chart.js";
import { add } from "lodash";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import * as firebase from "firebase/app";
import "firebase/firestore";
import { DEFAULT_COUNT_TAX_RATE, EmptyHome, Home } from "../models/Home";
import { EmptyIssue, Issue } from "../models/Issue";
import { HomeData } from "../types/HomeData";
import { useRouter } from "next/router";

function ErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong className="font-bold">Holy smokes!</strong>
      <span className="block sm:inline">{children}</span>
    </div>
  );
}

function Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={() => {
        onClick();
      }}
    >
      {children}
    </button>
  );
}

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

const database = firebase.firestore();

async function insertRecord<T>(collectionName: string, value: T) {
  return (await database.collection(collectionName).add(value)).id;
}

function updateAttribute(
  collectionName: string,
  id: string,
  attr: string,
  value: any
) {
  database
    .collection(collectionName)
    .doc(id)
    .set(
      {
        [attr]: value,
      },
      { merge: true }
    );
}

function updateHome(id: string, attr: string, value: any) {
  updateAttribute(`homes`, id, attr, value);
}

function updateIssue(id: string, attr: string, value: any) {
  updateAttribute(`issues`, id, attr, value);
}

function removeIssue(id: string) {
  database.collection(`issues`).doc(id).delete();
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
  const [val, setVal] = useState(value);

  return (
    <TextInput
      placeholder={placeholder}
      value={formatMoney(val || 0)}
      onChange={(newValue) => {
        const price = unformatMoney(newValue || "");
        onChange(price);
        setVal(price);
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
              <tr key={issue.id}>
                <td className="border px-4 py-2">
                  <TextInput
                    value={issue.name}
                    onChange={(val) => {
                      updateIssue(issue.id, "name", val);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <PriceInput
                    value={issue.cost}
                    onChange={(val) => {
                      updateIssue(issue.id, "cost", val);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <TextInput
                    value={issue.rawRequiredIn}
                    onChange={(val) => {
                      updateIssue(issue.id, "requiredIn", val);
                    }}
                  />
                </td>
                <td className="border px-4 py-2">
                  <Button
                    onClick={() => {
                      removeIssue(issue.id);
                    }}
                  >
                    X
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Button
        onClick={() => {
          insertRecord<IssueData>("issues", EmptyIssue);
        }}
      >
        Add Issue
      </Button>
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

function useCost() {
  const home = useCurrentHome();

  const { value: issues } = useFirestoreCollectionConverter<Issue>(
    "issues",
    Issue
  );

  if (!home || !issues) {
    return null;
  }

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

export function HomeSelector() {
  const router = useRouter();
  const { value: homes, error } = useFirestoreCollectionConverter<Home>(
    "homes",
    Home
  );

  if (error) {
    return <ErrorAlert>{error.toString()}</ErrorAlert>;
  }

  if (!homes) {
    return null;
  }

  return (
    <div>
      <Creatable
        options={homes.map((home: Home) => {
          return {
            value: home.id,
            label: home.address,
          };
        })}
        onChange={(result: any) => {
          router.push(`/homes/${result?.value}`);
        }}
        onCreateOption={async (address) => {
          const newId = await insertRecord<HomeData>("homes", {
            address,
          });
        }}
      />
    </div>
  );
}

function useCurrentHome(): Home | null {
  const router = useRouter();
  const homeId = router.query.id;
  const home = useFirestoreDocumentConverter<Home>(
    () =>
      homeId ? database.collection("homes").doc(homeId as string) : undefined,
    Home,
    [homeId]
  );

  return home;
}

function Basics() {
  const currentHome = useCurrentHome();

  if (!currentHome) {
    return "Loading home";
  }

  return (
    <form className="w-full max-w-lg">
      <div className="flex flex-wrap -mx-3 mb-6">
        <label
          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
          htmlFor="grid-first-name"
        >
          Address
        </label>
        <TextInput
          value={currentHome.address}
          onChange={(val) => {
            updateHome(currentHome.id, "address", val);
          }}
        />
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-first-name"
          >
            Base Price
          </label>
          <PriceInput
            placeholder="$800,000"
            value={currentHome.baseCost}
            onChange={(val) => {
              updateHome(currentHome.id, "baseCost", val);
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
              updateHome(currentHome.id, "countyTaxRate", val);
            }}
          />
        </div>
      </div>
    </form>
  );
}

export function Header() {
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
  const [currentHomeId, setCurrentHomeId] = useState<string | undefined>();

  return (
    <div className="w-full h-full flex justify-center bg-gray-200 ">
      <div className="w-full max-w-xl bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <Header />
        <HomeSelector />
        <Basics />
        <Issues />
        <Summary />
        <TimeChart />
      </div>
    </div>
  );
}
