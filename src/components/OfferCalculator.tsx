import classNames from "classnames";
import numeral from "numeral";
import { makeStyles } from "@material-ui/core/styles";
import {
  TimelineContent,
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineOppositeContent,
  TimelineSeparator,
  Alert,
} from "@material-ui/lab";
import { Add, Remove } from "@material-ui/icons";
import { Slider, Typography, CircularProgress } from "@material-ui/core";
import { useCityTransferTaxPercent } from "../hooks/useCost";
import { useIssues } from "../hooks/useIssues";
import Currency from "./Currency";
import {
  CITY_TRANSFER_TAX_SPLIT,
  CLOSING_COST_PERCENT,
  getMaximumOfferable,
} from "../models/Cost";
import { sumImmediateMonies, sumImmediateIssues } from "../utils";
import useMonies from "../hooks/useMonies";
import { useEffect, useMemo, useState } from "react";
import { isUndefined } from "lodash";

const useItemStyles = makeStyles(() => ({
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
  const dotColor = useMemo(() => {
    return type === "money" ? "primary" : "secondary";
  }, [type]);
  const icon = useMemo(() => {
    return type === "money" ? <Add /> : <Remove />;
  }, [type]);

  return (
    <TimelineItem>
      <TimelineOppositeContent
        className={classNames(classes.verticallyCentering, classes.alignRight)}
      >
        <Typography color="textSecondary">{name}</Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot color={dotColor}>{icon}</TimelineDot>
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
      You can offer up to <Currency>{offerableAmount}</Currency> on this house
    </Alert>
  ) : (
    <Alert severity="warning">
      You are <Currency>{Math.abs(offerableAmount)}</Currency> short of making
      an offer on this house
    </Alert>
  );
}

function useMaximumOfferable(): number | undefined {
  const issues = useIssues();
  const monies = useMonies();
  const cityTransferTaxPercent = useCityTransferTaxPercent();

  return useMemo(() => {
    if (!issues || !monies || !cityTransferTaxPercent) {
      return undefined;
    }

    return getMaximumOfferable({
      immediateCosts: sumImmediateIssues(issues),
      immediateMonies: sumImmediateMonies(monies),
      percentageCosts: cityTransferTaxPercent,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(issues), JSON.stringify(monies), cityTransferTaxPercent]);
}

function OfferSlider({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <Slider
      marks={[
        { value: 0, label: 0 },
        {
          value: max,
          label: numeral(max).format("$0a"),
        },
      ]}
      value={value}
      onChange={(event, value) => {
        onChange(value as number);
      }}
      max={max}
      min={0}
    />
  );
}

function Formula({
  money,
  cost,
  offer,
  cityTransferTaxPercent,
}: {
  money: number;
  cost: number;
  offer: number;
  cityTransferTaxPercent: number;
}) {
  const closingCostName = useMemo(() => {
    return `Closing costs (${numeral(CLOSING_COST_PERCENT).format("0%")})`;
  }, []);

  return (
    <Timeline>
      <Item name="Total Immediate Monies" amount={money} type="money" />
      <Item name="Total Immediate Issue Cost" amount={cost} type="cost" />
      <Item
        name={`${numeral(CITY_TRANSFER_TAX_SPLIT).format(
          "0%"
        )} of City Transfer Tax (${numeral(cityTransferTaxPercent).format(
          "0.00%"
        )})`}
        amount={offer * cityTransferTaxPercent * CITY_TRANSFER_TAX_SPLIT}
        type="cost"
      />
      <Item
        name={closingCostName}
        amount={CLOSING_COST_PERCENT * offer}
        type="cost"
      />
    </Timeline>
  );
}

export default function OfferCalculator() {
  const [offer, setOffer] = useState<number>();
  const issues = useIssues();
  const monies = useMonies();
  const cityTransferTaxPercent = useCityTransferTaxPercent();
  const maximumOfferable = useMaximumOfferable();

  useEffect(() => {
    if (!offer) {
      setOffer(maximumOfferable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maximumOfferable, offer]);

  const money = useMemo(
    () => (monies ? sumImmediateMonies(monies) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(monies)]
  );

  const cost = useMemo(
    () => (issues ? sumImmediateIssues(issues) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(issues)]
  );

  if (
    isUndefined(cost) ||
    isUndefined(money) ||
    isUndefined(maximumOfferable) ||
    isUndefined(offer) ||
    isUndefined(cityTransferTaxPercent)
  ) {
    return <CircularProgress />;
  }

  return (
    <>
      <Offerable offerableAmount={maximumOfferable} />
      <Typography variant="h6" align="center">
        Offer: <Currency>{offer}</Currency>
      </Typography>
      <OfferSlider
        max={maximumOfferable}
        value={offer}
        onChange={(val) => {
          setOffer(val);
        }}
      />
      <Formula
        cityTransferTaxPercent={cityTransferTaxPercent}
        offer={offer}
        money={money}
        cost={cost}
      />
    </>
  );
}
