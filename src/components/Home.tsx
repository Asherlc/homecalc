import "../firebaseConfig";
import { formatMoney } from "accounting";
import { HomeSelector } from "./HomeSelector";
import { useCurrentHome } from "../hooks/useCurrentHome";
import { PriceInput } from "./inputs";
import { Issues } from "./Issues";
import { TimeChart } from "./TimeChart";
import { Card, Grid, CardContent, CircularProgress } from "@material-ui/core";
import { database } from "../database";
import AddressForm from "./AddressForm";
import { useCost } from "../hooks/useCost";
import { HomeData } from "../types/HomeData";

export function updateAttribute(
  collectionName: string,
  id: string,
  values: {
    [key: string]: any;
  }
) {
  return database
    .collection(collectionName)
    .doc(id)
    .set(values, { merge: true });
}

function updateHome(id: string, values: Partial<HomeData>) {
  return updateAttribute(`homes`, id, values);
}

function Summary() {
  const cost = useCost();

  if (!cost) {
    return <CircularProgress />;
  }

  return (
    <Card>
      <CardContent>
        <p>
          50% of City Transfer Tax ({cost.cityTransferTaxPercent}%):{" "}
          {formatMoney(cost.cityTransferTax, undefined, 0)}
        </p>
        <p>Total Cost: {formatMoney(cost.total, undefined, 0)}</p>
        <p>
          Annual Tax Cost ({cost.countyPropertyTaxPercent}%):{" "}
          {formatMoney(cost.annualTaxes, undefined, 0)}
        </p>
      </CardContent>
    </Card>
  );
}

function Basics() {
  const currentHome = useCurrentHome();

  if (!currentHome) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <PriceInput
          label="Base Price"
          placeholder="$800,000"
          value={currentHome.baseCost}
          onChange={(val) => {
            updateHome(currentHome.id, { baseCost: val });
          }}
        />
      </Grid>
    </Grid>
  );
}

function AddressEditor() {
  const currentHome = useCurrentHome();

  if (!currentHome) {
    return <CircularProgress />;
  }

  return (
    <AddressForm
      initialValues={{
        address: currentHome.address,
        city: currentHome.city,
        county: currentHome.county,
      }}
      autosave={true}
      onSubmit={(values) => {
        return updateAttribute(`homes`, currentHome.id, values);
      }}
    />
  );
}

export default function HomeComponent() {
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HomeSelector />
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
              <Basics />
            </CardContent>
          </Card>
        </Grid>
        <Grid>
          <Card>
            <CardContent>
              <AddressEditor />
            </CardContent>
          </Card>
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
