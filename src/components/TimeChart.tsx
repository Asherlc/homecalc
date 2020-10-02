import { withStyles } from "@material-ui/core/styles";
import { Stack, Animation } from "@devexpress/dx-react-chart";
import { addYears, eachMonthOfInterval, format } from "date-fns";
import { Paper, CircularProgress } from "@material-ui/core";
import { useCost } from "./Home";
import {
  Chart,
  BarSeries,
  Title,
  ArgumentAxis,
  ValueAxis,
  Legend,
} from "@devexpress/dx-react-chart-material-ui";

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

  if (!cost) {
    return <CircularProgress />;
  }

  const chartData = monthsFromToday.map((date) => {
    const monthIssues = cost.issues.reduce((hash, issue) => {
      return {
        ...hash,
        [issue.name || ""]:
          issue.requiredIn?.getMonth() === date.getMonth()
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
        {cost.issues.map((issue) => {
          return (
            <BarSeries
              key={issue.name}
              name={issue.name || ""}
              valueField={issue.name}
              argumentField={"month"}
            />
          );
        })}
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
      </Chart>
    </Paper>
  );
}
