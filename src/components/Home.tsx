import "../firebaseConfig";
import CostFormula from "./OfferCalculator";
import { HomeSelector } from "./HomeSelector";
import { useCurrentHome } from "../hooks/useCurrentHome";
import { Issues } from "./Issues";
import { LinearProgress, Card, Grid, CardContent } from "@material-ui/core";
import AddressForm from "./AddressForm";
import { Monies } from "./Monies";
import handleException from "../handleException";

function AddressEditor() {
  const currentHome = useCurrentHome();

  if (!currentHome) {
    return <LinearProgress />;
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

export default function HomeComponent(): JSX.Element {
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HomeSelector />
        </Grid>
        <Grid item sm={6} xs={12}>
          <CostFormula />
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
      </Grid>
    </>
  );
}
