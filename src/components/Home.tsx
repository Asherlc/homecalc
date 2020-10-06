import "../firebaseConfig";
import CostFormula from "./CostFormula";
import { formatMoney } from "accounting";
import { HomeSelector } from "./HomeSelector";
import { useCurrentHome } from "../hooks/useCurrentHome";
import { PriceInput } from "./inputs";
import { Issues } from "./Issues";
import { TimeChart } from "./TimeChart";
import {
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Card,
  Grid,
  CardContent,
  CircularProgress,
} from "@material-ui/core";
import AddressForm from "./AddressForm";
import { useCost } from "../hooks/useCost";
import { HomeData } from "../types/HomeData";
import { updateAttribute } from "../firebaseUtils";
import { Income } from "./Income";
import { Collections } from "../database";

function updateHome(id: string, values: Partial<HomeData>) {
  return updateAttribute(Collections.Homes, id, values);
}

function SummaryItem({ name, cost }: { name: string; cost: string }) {
  return (
    <ListItem>
      <ListItemText primary={name} secondary={cost} />
    </ListItem>
  );
}

function Summary() {
  const cost = useCost();

  if (!cost) {
    return <CircularProgress />;
  }

  return (
    <Card>
      <CardContent>
        <List subheader={<ListSubheader>Summary</ListSubheader>}>
          <SummaryItem
            name={`Annual Tax Cost (${Number(
              cost.countyPropertyTaxPercent
            ).toFixed(2)}%)`}
            cost={formatMoney(cost.annualTaxes, undefined, 0)}
          />
        </List>
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
        return updateAttribute(Collections.Homes, currentHome.id, values);
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
        <Grid item container sm={6} xs={12} spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Basics />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} container spacing={3}>
            <Grid item xs={12}>
              <Summary />
            </Grid>
            <Grid item xs={12}>
              <CostFormula />
            </Grid>
          </Grid>
        </Grid>
        <Grid container item sm={6} xs={12} spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <AddressEditor />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Income />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Issues />
        </Grid>
        <Grid item xs={12}>
          <TimeChart />
        </Grid>
      </Grid>
    </>
  );
}
