import classNames from "classnames";
import numeral from "numeral";
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
} from "../hooks/useCost";
import { useIssues } from "../hooks/useIssues";
import Currency from "./Currency";
import {
  CITY_TRANSFER_TAX_SPLIT,
  CLOSING_COST_PERCENT,
  Cost,
  getMaximumOfferable,
} from "../models/Cost";
import { sumImmediateMonies, sumImmediateIssues } from "../utils";
import useMonies from "../hooks/useMonies";
import { SliderWithNumberInput } from "./SliderWithNumberInput";
import { useEffect, useState } from "react";
import { PriceInput } from "./inputs";

const useItemStyles = makeStyles((theme) => ({
  verticallyCentering: {
    display: "flex",
    alignItems: "center",
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: "16px",
  },
  alignRight: {
    justifyContent: "flex-end",
  },
}));

function Item({
  name,
  amount,
  type,
}: {
  name: string;
  amount: number;
  type: "cost" | "money";
}) {
  const classes = useItemStyles();

  return (
    <TimelineItem>
      <TimelineOppositeContent
        className={classNames(classes.verticallyCentering, classes.alignRight)}
      >
        <Typography color="textSecondary">{name}</Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color={type === "money" ? "primary" : "secondary"}>
          {type === "money" ? <Add /> : <Remove />}
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
  const monies = useMonies();
  const cityTransferTaxPercent = useCityTransferTaxPercent();
  const costGenerator = useCostGenerator();

  if (!issues || !monies || !cityTransferTaxPercent) {
    return undefined;
  }

  const maximumOfferable = getMaximumOfferable({
    immediateCosts: sumImmediateIssues(issues),
    immediateMonies: sumImmediateMonies(monies),
    percentageCosts: cityTransferTaxPercent,
  });

  return costGenerator(maximumOfferable);
}

export default function OfferCalculator() {
  const [offer, setOffer] = useState<Cost>();
  const issues = useIssues();
  const monies = useMonies();
  const maximumOfferableCost = useMaximumOfferableCost();

  useEffect(() => {
    if (!offer) {
      setOffer(maximumOfferableCost);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(maximumOfferableCost), !!offer]);

  const costGenerator = useCostGenerator();

  if (!issues || !monies || !maximumOfferableCost || !offer) {
    return <CircularProgress />;
  }

  const immediateMonies = sumImmediateMonies(monies);

  return (
    <Timeline>
      <SliderWithNumberInput
        value={offer.baseCost}
        onChange={(newOfferBaseCost) => {
          setOffer(costGenerator(newOfferBaseCost));
        }}
        max={maximumOfferableCost.baseCost}
        min={0}
        inputComponent={PriceInput}
      />
      <Item
        name="Total Immediate Monies"
        amount={immediateMonies}
        type="money"
      />
      <Item
        name="Total Immediate Issue Cost"
        amount={sumImmediateIssues(issues)}
        type="cost"
      />
      <Item
        name={`${numeral(CITY_TRANSFER_TAX_SPLIT).format(
          "0%"
        )} of City Transfer Tax (${numeral(offer.cityTransferTaxPercent).format(
          "0.00%"
        )})`}
        amount={offer.cityTransferTax}
        type="cost"
      />
      <Item
        name={`Closing costs (${numeral(CLOSING_COST_PERCENT).format("0%")})`}
        amount={offer.closingCosts}
        type="cost"
      />
      <Offerable offerableAmount={maximumOfferableCost.baseCost} />
    </Timeline>
  );
}
