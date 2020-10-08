import numeral from "numeral";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { eachMonthOfInterval, format, startOfMonth } from "date-fns";
import { colors, Paper, CircularProgress } from "@material-ui/core";
import { useIssues } from "../hooks/useIssues";
import { groupBy, last, sortBy } from "lodash";
import { Issue } from "../models/Issue";

interface ChartDataPoint {
  date: number;
  [nameValue: string]: number;
}

class ChartData {
  issues: Issue[];

  constructor(issues: Issue[]) {
    this.issues = issues;
  }

  private get issuesByMonth() {
    return groupBy(this.issues, (issue) => {
      return startOfMonth(issue.requiredInDate as Date).getTime();
    });
  }

  get points(): ChartDataPoint[] {
    const issuesByMonth = this.issuesByMonth;

    return Object.entries(issuesByMonth).map(([month, issues]) => {
      const monthDate = new Date(parseInt(month));

      return issues.reduce(
        (point, issue) => {
          return { ...point, [`cost:${issue.name}`]: issue.buyerCost };
        },
        {
          date: monthDate.getTime(),
        }
      );
    });
  }

  get ticks(): number[] {
    const timeSortedPoints = sortBy(this.points, "date");

    const earliestPoint = timeSortedPoints[0];
    const latestPoint = last(timeSortedPoints) || timeSortedPoints[0];
    const monthsToChart = eachMonthOfInterval({
      start: earliestPoint.date,
      end: latestPoint.date,
    });

    return monthsToChart.map((date) => date.getTime());
  }
}

function getColor(index: number): string {
  const colorArray = Object.values(colors).map((color) => (color as any)[500]);
  return colorArray[index % colorArray.length];
}

export function TimeChart() {
  const issues = useIssues();

  if (!issues) {
    return <CircularProgress />;
  }

  const chartData = new ChartData(issues);

  return (
    <Paper>
      <ResponsiveContainer height={500} width="100%">
        <ComposedChart data={chartData.points}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis
            dataKey={(point) => point.date}
            ticks={chartData.ticks}
            type="number"
            domain={["auto", "auto"]}
            tickFormatter={(tick: number) => {
              return format(tick, "yyyy-MMM");
            }}
          />
          <YAxis name="amount" allowDuplicatedCategory={false} />
          <Tooltip
            formatter={(amount) => {
              return numeral(amount).format("$0,0");
            }}
            labelFormatter={(date) => format(new Date(date), "yyyy-MMM")}
          />
          <Legend />
          <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
          {issues.map((issue, index) => (
            <Bar
              key={issue.id}
              name={issue.name}
              dataKey={(point) => {
                return point[`cost:${issue.name}`] ?? null;
              }}
              barSize={60}
              stackId={"a"}
              fill={getColor(index)}
            />
          ))}
          <Line type="monotone" dataKey="uv" stroke="#ff7300" />
          {/* <Scatter dataKey="cnt" fill="red" /> */}
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
}
