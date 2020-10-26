import numeral from "numeral";
import { useCurrentHome } from "../hooks/useCurrentHome";
import {
  LinearProgress,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Card,
  CardContent,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useCountyPropertyTaxPercent } from "../hooks/useCost";
import { annualTaxes } from "../models/Cost";

function SummaryItem({ name, cost }: { name: string; cost: string }) {
  return (
    <ListItem>
      <ListItemText primary={name} secondary={cost} />
    </ListItem>
  );
}
export default function Summary({
  baseCost,
}: {
  baseCost: number;
}): JSX.Element {
  const {
    data: countyPropertyTaxPercent,
    error,
  } = useCountyPropertyTaxPercent();
  const home = useCurrentHome();
  const homeData = home?.data();

  if (error) {
    return <Alert severity="error">Error fetching property tax</Alert>;
  }

  if (!countyPropertyTaxPercent || !homeData) {
    return <LinearProgress />;
  }

  return (
    <Card>
      <CardContent>
        <List subheader={<ListSubheader>Summary</ListSubheader>}>
          <SummaryItem
            name={`Annual Tax Cost (${numeral(
              countyPropertyTaxPercent / 100
            ).format("0.00%")})`}
            cost={numeral(
              annualTaxes(countyPropertyTaxPercent, baseCost)
            ).format("$0,0")}
          />
        </List>
      </CardContent>
    </Card>
  );
}
