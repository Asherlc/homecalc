import { Hidden, Input, Slider, Grid } from "@material-ui/core";
import { useEffect, useState } from "react";

interface Props {
  value: number;
  onChangeCommitted: (val: number | undefined) => void;
  max: number;
  min: number;
}

export function SliderWithNumberInput({
  value,
  onChangeCommitted,
  min = 0,
  max = 100,
}: Props) {
  const [number, setNumber] = useState(value);

  useEffect(() => {
    setNumber(number);
  }, [number]);

  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        <Hidden smDown>
          <Grid item xs>
            <Slider
              value={number}
              onChangeCommitted={(e, val) => {
                onChangeCommitted(val as number);
              }}
              onChange={(e, val) => {
                setNumber(val as number);
              }}
              min={min}
              max={max}
            />
          </Grid>
        </Hidden>
        <Grid item>
          <Input
            value={number}
            margin="dense"
            onChange={(e) => {
              const int = e.target.value ? parseInt(e.target.value) : undefined;
              if (!int) {
                return;
              }
              setNumber(int);
              onChangeCommitted(int);
            }}
            inputProps={{
              step: 10,
              min,
              max,
              type: "number",
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}
