import { addYears, eachMonthOfInterval, format } from "date-fns";
import { Paper, CircularProgress } from "@material-ui/core";
import { useCost } from "./Home";
import {
  Chart,
  BarSeries,
  Title,
  ArgumentAxis,
  ValueAxis,
} from "@devexpress/dx-react-chart-material-ui";
import { Animation } from "@devexpress/dx-react-chart";

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
        <Title text="World population" />
        <Animation />
      </Chart>
    </Paper>
  );
}
