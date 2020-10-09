import numeral from "numeral";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
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

interface CumulativePoint {
  date: number;
  amount: number;
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

  get totalCost(): number {
    return last(this.cumulativeCostPoints)?.amount ?? 0;
  }

  get cumulativeCostPoints(): CumulativePoint[] {
    const sortedIssues = sortBy(this.issues, "requiredInDate");
    let cumulative = 0;
    const zeroDate = startOfMonth(sortedIssues[0].requiredInDate);

    const points: { [date: number]: CumulativePoint } = {
      [zeroDate.getTime()]: {
        date: zeroDate.getTime(),
        amount: 0,
      },
    };

    for (const issue of sortedIssues) {
      cumulative = cumulative + issue.buyerCost;
      const time = (issue.requiredInDate as Date).getTime();

      points[time] = {
        date: time,
        amount: cumulative,
      };
    }

    return Object.values(points);
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
      <ResponsiveContainer height={800} width="100%">
        <ComposedChart data={chartData.points}>
          <XAxis
            dataKey={(point) => point.date}
            ticks={chartData.ticks}
            type="number"
            domain={["auto", "auto"]}
            tickFormatter={(tick: number) => {
              return format(tick, "MMM yy");
            }}
          />
          <YAxis
            name="amount"
            allowDuplicatedCategory={false}
            domain={[0, chartData.totalCost]}
            tickFormatter={(tick) => {
              return numeral(tick).format("$0,0");
            }}
          />
          <Tooltip
            formatter={(amount) => {
              return numeral(amount).format("$0,0");
            }}
            labelFormatter={(date) => format(new Date(date), "MMM d, yyyy")}
          />
          <Legend layout="vertical" />
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
            ></Bar>
          ))}
          <Line
            type="monotone"
            data={chartData.cumulativeCostPoints}
            dataKey="amount"
            stroke="#ff7300"
            name="Cumulative Cost"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
}
