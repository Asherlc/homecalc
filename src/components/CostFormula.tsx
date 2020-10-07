import { makeStyles } from "@material-ui/core/styles";
import {
  TimelineContent,
  TimelineConnector,
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineOppositeContent,
  TimelineSeparator,
  Alert,
} from "@material-ui/lab";
import { Add, Remove } from "@material-ui/icons";
import { Typography, CircularProgress } from "@material-ui/core";
import {
  useCityTransferTaxPercent,
  useCost,
  useCostGenerator,
  useIssues,
} from "../hooks/useCost";
import Currency from "./Currency";
import { Cost, getMaximumOfferable } from "../models/Cost";
import {
  sumImmediateIncomes,
  sumImmediateIssues,
  sumLineItemsBy,
  withImmediateLineItems,
} from "../utils";
import useIncomes from "../hooks/useIncomes";

const useItemStyles = makeStyles((theme) => ({
  verticallyCentering: {
    display: "flex",
    alignItems: "center",
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: "16px",
  },
}));

function Item({
  name,
  amount,
  type,
}: {
  name: string;
  amount: number;
  type: "cost" | "income";
}) {
  const classes = useItemStyles();

  return (
    <TimelineItem>
      <TimelineOppositeContent className={classes.verticallyCentering}>
        <Typography color="textSecondary">{name}</Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color={type === "income" ? "primary" : "secondary"}>
          {type === "income" ? <Add /> : <Remove />}
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent className={classes.verticallyCentering}>
        <Typography>
          <Currency>{amount}</Currency>
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
}

function Offerable({ offerableAmount }: { offerableAmount: number }) {
  return offerableAmount > 0 ? (
    <Alert severity="success">
      You can offer <Currency>{offerableAmount}</Currency> on this house
    </Alert>
  ) : (
    <Alert severity="warning">
      You are <Currency>{Math.abs(offerableAmount)}</Currency> short of making
      an offer on this house
    </Alert>
  );
}

function useMaximumOfferableCost(): Cost | undefined {
  const issues = useIssues();
  const incomes = useIncomes();
  const cityTransferTaxPercent = useCityTransferTaxPercent();
  const costGenerator = useCostGenerator();

  if (!issues || !incomes || !cityTransferTaxPercent) {
    return undefined;
  }

  const maximumOfferable = getMaximumOfferable({
    immediateCosts: sumImmediateIssues(issues),
    immediateMonies: sumImmediateIncomes(incomes),
    percentageCosts: cityTransferTaxPercent,
  });

  return costGenerator(maximumOfferable);
}

export default function CustomizedTimeline() {
  const issues = useIssues();
  const incomes = useIncomes();
  const maximumOfferableCost = useMaximumOfferableCost();

  if (!issues || !incomes || !maximumOfferableCost) {
    return <CircularProgress />;
  }

  const immediateMonies = sumImmediateIncomes(incomes);

  return (
    <Timeline>
      <Item
        name="Total Immediate Income"
        amount={immediateMonies}
        type="income"
      />
      <Item
        name="Total Immediate Issue Cost"
        amount={sumImmediateIssues(issues)}
        type="cost"
      />
      <Item
        name={`50% of City Transfer Tax (${maximumOfferableCost.cityTransferTaxPercent}%)`}
        amount={maximumOfferableCost.cityTransferTax}
        type="cost"
      />
      <Offerable offerableAmount={maximumOfferableCost.baseCost} />
    </Timeline>
  );
}
