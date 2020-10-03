import "../firebaseConfig";
import { formatMoney } from "accounting";
import { useFirestoreCollectionConverter } from "../hooks/firebase";
import { add } from "lodash";
import * as firebase from "firebase/app";
import "firebase/firestore";
import { DEFAULT_COUNT_TAX_RATE, Home } from "../models/Home";
import { Issue } from "../models/Issue";
import { HomeSelector } from "./HomeSelector";
import { useCurrentHome } from "../hooks/useCurrentHome";
import { TextInput, PriceInput } from "./inputs";
import { Issues } from "./Issues";
import { TimeChart } from "./TimeChart";
import { Card, Grid, CardContent, CircularProgress } from "@material-ui/core";

class Cost {
  issues: Issue[];
  home: Home;

  constructor({ issues, home }: { issues: Issue[]; home: Home }) {
    this.issues = issues;
    this.home = home;
  }

  get totalIssueCost() {
    return this.issues
      .filter((issue) => issue.buyerCost)
      .reduce((total, issue) => {
        return add(total, issue.buyerCost as number);
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

  const issues = useFirestoreCollectionConverter(
    () => {
      return home?.id
        ? database
            .collection("issues")
            .where("homeId", "==", home.id)
            .orderBy("createdAt")
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
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <TextInput
          label="Address"
          value={currentHome.address}
          onChange={(val) => {
            updateHome(currentHome.id, "address", val);
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <PriceInput
          label="Base Price"
          placeholder="$800,000"
          value={currentHome.baseCost}
          onChange={(val) => {
            updateHome(currentHome.id, "baseCost", val);
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextInput
          label="County Tax Rate (%)"
          placeholder={DEFAULT_COUNT_TAX_RATE.toString()}
          value={currentHome.countyTaxRate}
          onChange={(val) => {
            updateHome(currentHome.id, "countyTaxRate", val);
          }}
        />
      </Grid>
    </Grid>
  );
}

export default function HomeComponent() {
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HomeSelector />
        </Grid>
        <Grid item xs={12}>
          <Basics />
        </Grid>
        <Grid item xs={12}>
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
