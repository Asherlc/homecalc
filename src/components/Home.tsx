import numeral from "numeral";
import "../firebaseConfig";
import CostFormula from "./OfferCalculator";
import { HomeSelector } from "./HomeSelector";
import { useCurrentHome } from "../hooks/useCurrentHome";
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
import { Monies } from "./Monies";
import { PriceField } from "./inputs";
import handleException from "../handleException";

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
            name={`Annual Tax Cost (${numeral(
              cost.countyPropertyTaxPercent
            ).format("0.00%")}`}
            cost={numeral(cost.annualTaxes).format("$0,0")}
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
        <PriceField
          label="Asking Price"
          placeholder="$800,000"
          value={currentHome.data()?.askingPrice}
          onChange={async (event) => {
            try {
              await currentHome.ref.update({
                baseCost: parseInt(event.target.value),
              });
            } catch (e) {
              handleException(e);
            }
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
        address: currentHome.data()?.address || "",
        city: currentHome.data()?.city || "",
        stateAbbreviation: currentHome.data()?.stateAbbreviation || "",
      }}
      autosave={true}
      onSubmit={async (values) => {
        try {
          await currentHome.ref.update(values);
        } catch (e) {
          handleException(e);
        }
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
            <Monies />
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
