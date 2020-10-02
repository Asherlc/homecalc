import Paper from "@material-ui/core/Paper";
import Chart from "chart.js";
import { useEffect, useRef } from "react";
import { useCost, monthsFromToday, MONTHS, CHART_COLORS } from "./Home";

export function TimeChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRenderingContext2D:
    | CanvasRenderingContext2D
    | null
    | undefined = canvasRef.current?.getContext("2d");

  const cost = useCost();

  useEffect(() => {
    if (canvasRenderingContext2D && cost) {
      // eslint-disable-next-line no-new
      new Chart(canvasRenderingContext2D, {
        type: "bar",
        options: {
          scales: {
            yAxes: [
              {
                stacked: true,
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
        data: {
          labels: monthsFromToday.map((date) => MONTHS[date.getMonth()]),
          datasets: cost.issues
            .filter((issue) => issue.valid)
            .map((issue, index) => {
              return {
                backgroundColor: Object.values(CHART_COLORS)[index],
                label: issue.name,
                data: issue.costPerMonth,
              };
            }),
        },
      });
    }
  }, [canvasRenderingContext2D, cost]);

  return (
    <Paper>
      <canvas ref={canvasRef} width="100%" height="100%"></canvas>
    </Paper>
  );
}
