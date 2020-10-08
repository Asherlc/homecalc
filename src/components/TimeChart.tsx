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

import { addYears, eachMonthOfInterval, format } from "date-fns";
import { colors, Paper, CircularProgress } from "@material-ui/core";
import { useIssues } from "../hooks/useIssues";

const today = new Date();
const inOneYear = addYears(today, 1);
export const monthsFromToday = eachMonthOfInterval({
  start: today,
  end: inOneYear,
});

function getColor(index: number): string {
  const colorArray = Object.values(colors).map((color) => (color as any)[300]);
  return colorArray[index % colorArray.length];
}

export function TimeChart() {
  const issues = useIssues();

  if (!issues) {
    return <CircularProgress />;
  }

  const chartData = monthsFromToday.map((date) => {
    return issues
      .filter((issue) => {
        return issue.requiredInDate?.getMonth() === date.getMonth();
      })
      .reduce(
        (hash, issue) => {
          return {
            ...hash,
            [issue.name]: issue.cost,
          };
        },
        {
          name: format(date, "MMM"),
        }
      );
  });

  return (
    <Paper>
      <ResponsiveContainer height={500} width="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
          {issues.map((issue, index) => {
            return (
              <Bar
                key={issue.id}
                dataKey={issue.name}
                barSize={20}
                fill={getColor(index)}
                stackId="a"
              />
            );
          })}
          <Line type="monotone" dataKey="uv" stroke="#ff7300" />
          {/* <Scatter dataKey="cnt" fill="red" /> */}
        </ComposedChart>
      </ResponsiveContainer>
    </Paper>
  );
}
