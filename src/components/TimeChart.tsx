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

import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { colors, Paper, CircularProgress } from "@material-ui/core";
import { useIssues } from "../hooks/useIssues";
import { groupBy, last, sortBy } from "lodash";

interface ChartDataPoint {
  date: number;
  [nameValue: string]: number;
}

interface Item {
  date: Date;
  amount: number;
  name: string;
}

interface CumulativePoint {
  date: number;
  amount: number;
}

enum Namespaces {
  Cost = "cost",
  Money = "money",
}

class ChartData {
  items: Item[];
  namespace: Namespaces;

  constructor(namespace: Namespaces, items: Item[]) {
    this.items = items;
    this.namespace = namespace;
  }

  private get itemsByMonth() {
    return groupBy(this.items, (item) => {
      return startOfMonth(item.date).getTime();
    });
  }

  get totalCost(): number {
    return last(this.cumulativePoints)?.amount ?? 0;
  }

  get cumulativePoints(): CumulativePoint[] {
    const sortedItems = sortBy(this.items, "date");
    let cumulative = 0;
    const zeroDate = startOfMonth(sortedItems[0].date);
    const endDate = endOfMonth((last(sortedItems) as Item).date);

    const points: { [date: number]: CumulativePoint } = {
      [zeroDate.getTime()]: {
        date: zeroDate.getTime(),
        amount: 0,
      },
    };

    for (const item of sortedItems) {
      cumulative = cumulative + item.amount;
      const time = item.date.getTime();

      points[time] = {
        date: time,
        amount: cumulative,
      };
    }

    points[endDate.getTime()] = {
      date: endDate.getTime(),
      amount: cumulative,
    };

    return Object.values(points);
  }

  get points(): ChartDataPoint[] {
    return Object.entries(this.itemsByMonth).map(([month, items]) => {
      const monthDate = new Date(parseInt(month));

      return items.reduce(
        (point, item) => {
          return { ...point, [`${this.namespace}:${item.name}`]: item.amount };
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
  const { issues } = useIssues();

  if (!issues) {
    return <CircularProgress />;
  }

  const costData = new ChartData(
    Namespaces.Cost,
    issues.map((issue) => {
      return {
        name: issue.name,
        amount: issue.buyerCost,
        date: issue.requiredInDate,
      };
    })
  );

  return (
    <Paper>
      <ResponsiveContainer height={800} width="100%">
        <ComposedChart data={costData.points}>
          <XAxis
            dataKey={(point) => point.date}
            ticks={costData.ticks}
            type="number"
            domain={["auto", "auto"]}
            tickFormatter={(tick: number) => {
              return format(tick, "MMM yy");
            }}
          />
          <YAxis
            name="amount"
            allowDuplicatedCategory={false}
            domain={[0, Math.round(costData.totalCost / 1000) * 1000]}
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
                return point[`${Namespaces.Cost}:${issue.name}`] ?? null;
              }}
              barSize={60}
              stackId={"a"}
              fill={getColor(index)}
            ></Bar>
          ))}
          <Line
            type="monotone"
            data={costData.cumulativePoints}
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
