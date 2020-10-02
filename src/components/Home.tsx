import "../firebaseConfig";
import { formatMoney } from "accounting";
import { useFirestoreCollectionConverter } from "../hooks/firebase";
import { addYears, eachMonthOfInterval } from "date-fns";
import { add } from "lodash";
import { ReactNode } from "react";
import * as firebase from "firebase/app";
import "firebase/firestore";
import { DEFAULT_COUNT_TAX_RATE, Home } from "../models/Home";
import { Issue } from "../models/Issue";
import { HomeSelector } from "./HomeSelector";
import { useCurrentHome } from "../hooks/useCurrentHome";
import { Header } from "./Header";
import { TextInput, PriceInput } from "./inputs";
import { Alert } from "@material-ui/lab";
import { Issues } from "./Issues";
import { TimeChart } from "./TimeChart";
import { Card, Grid, CardContent, CircularProgress } from "@material-ui/core";

function ErrorAlert({ children }: { children: ReactNode }) {
  return <Alert severity="error">{children}</Alert>;
}

export const CHART_COLORS = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  purple: "rgb(153, 102, 255)",
  grey: "rgb(201, 203, 207)",
};

export const MONTHS = [
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
  home: Home;

  constructor({ issues, home }: { issues: Issue[]; home: Home }) {
    this.issues = issues;
    this.home = home;
  }

  get totalIssueCost() {
    return this.issues
      .filter((issue) => issue.cost)
      .reduce((total, issue) => {
        return add(total, issue.cost as number);
      }, 0);
  }

  get baseCost(): number {
    return this.home.baseCost;
  }

  get countyTaxRate() {
    return this.home.countyTaxRate;
  }

  get total() {
    return add(this.totalIssueCost, this.baseCost);
  }

  get annualTaxes() {
    return Number((this.countyTaxRate / 100) * this.baseCost).toFixed(2);
  }
}

export const database = firebase.firestore();

export function updateAttribute(
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

function Summary() {
  const cost = useCost();

  if (!cost) {
    return <CircularProgress />;
  }

  return (
    <Card>
      <CardContent>
        <p>Total Cost: {formatMoney(cost.total, undefined, 0)}</p>
        <p>Annual Tax Cost: {formatMoney(cost.annualTaxes, undefined, 0)}</p>
      </CardContent>
    </Card>
  );
}

export function useCost() {
  const home = useCurrentHome();

  const issues = useFirestoreCollectionConverter<Issue>(
    () => {
      return home?.id
        ? database.collection("issues").where("homeId", "==", home.id)
        : undefined;
    },
    Issue,
    [home?.id]
  );

  if (!home || !issues) {
    return null;
  }

  return new Cost({
    issues: issues,
    home: home,
  });
}

function Basics() {
  const currentHome = useCurrentHome();

  if (!currentHome) {
    return <CircularProgress />;
  }

  return (
    <form>
      <TextInput
        label="Address"
        value={currentHome.address}
        onChange={(val) => {
          updateHome(currentHome.id, "address", val);
        }}
      />
      <PriceInput
        label="Base Price"
        placeholder="$800,000"
        value={currentHome.baseCost}
        onChange={(val) => {
          updateHome(currentHome.id, "baseCost", val);
        }}
      />
      <TextInput
        label="County Tax Rate (%)"
        placeholder={DEFAULT_COUNT_TAX_RATE.toString()}
        value={currentHome.countyTaxRate}
        onChange={(val) => {
          updateHome(currentHome.id, "countyTaxRate", val);
        }}
      />
    </form>
  );
}

export default function HomeComponent() {
  return (
    <>
      <Header />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HomeSelector />
        </Grid>
        <Grid item xs={12}>
          <Basics />
        </Grid>
        <Grid item>
          <Issues />
        </Grid>
        <Grid item>
          <Summary />
        </Grid>
        <Grid item xs={12}>
          <TimeChart />
        </Grid>
      </Grid>
    </>
  );
}
