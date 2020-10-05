import {
  EventTracker,
  Stack,
  Animation,
  SeriesRef,
} from "@devexpress/dx-react-chart";
import { Plugin } from "@devexpress/dx-react-core";
import { withStyles } from "@material-ui/core/styles";

import { addYears, eachMonthOfInterval, format } from "date-fns";
import { Paper, CircularProgress } from "@material-ui/core";
import { useCost } from "../hooks/useCost";
import {
  Chart,
  BarSeries,
  Title,
  ArgumentAxis,
  Tooltip,
  ValueAxis,
  Legend,
} from "@devexpress/dx-react-chart-material-ui";
import { useState } from "react";

const legendStyles = () => ({
  root: {
    display: "flex",
    margin: "auto",
    flexDirection: "row",
  },
});
const legendRootBase = ({ classes, ...restProps }: any) => (
  <Legend.Root {...restProps} className={classes.root} />
);
const Root = withStyles(legendStyles as any, { name: "LegendRoot" })(
  legendRootBase
);

const legendLabelStyles = () => ({
  label: {
    whiteSpace: "nowrap",
  },
});
const legendLabelBase = ({ classes, ...restProps }: any) => (
  <Legend.Label className={classes.label} {...restProps} />
);
const Label = withStyles(legendLabelStyles as any, { name: "LegendLabel" })(
  legendLabelBase
);

const today = new Date();
const inOneYear = addYears(today, 1);
export const monthsFromToday = eachMonthOfInterval({
  start: today,
  end: inOneYear,
});

export function TimeChart() {
  const cost = useCost();
  const [targetItem, setTargetItem] = useState<SeriesRef>();

  if (!cost) {
    return <CircularProgress />;
  }

  const chartData = monthsFromToday.map((date) => {
    const monthIssues = cost.issues.reduce((hash, issue) => {
      return {
        ...hash,
        [issue.id]:
          issue.requiredInDate?.getMonth() === date.getMonth()
            ? issue.buyerCost
            : 0,
      };
    }, {});
    const month = {
      month: format(date, "MMMM"),
    };

    return { ...month, ...monthIssues };
  });

  return (
    <Paper>
      <Chart data={chartData}>
        <ArgumentAxis />
        <ValueAxis />
        <Plugin name="ser">
          {cost.issues.map((issue) => {
            return (
              <BarSeries
                key={issue.id}
                name={issue.name}
                valueField={issue.id}
                argumentField={"month"}
              />
            );
          })}
        </Plugin>
        <Title text="Cost Per Month" />

        <Legend
          position="bottom"
          rootComponent={Root as any}
          labelComponent={Label as any}
        />
        <Stack
          stacks={[
            {
              series: cost.issues.map((issue) => issue.name || ""),
            },
          ]}
        />
        <Animation />
        <EventTracker />
        <Tooltip
          contentComponent={() => {
            return <>{targetItem?.series}</>;
          }}
          targetItem={targetItem}
          onTargetItemChange={setTargetItem}
        />
      </Chart>
    </Paper>
  );
}
