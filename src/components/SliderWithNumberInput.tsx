import { Hidden, Input, Slider, Grid } from "@material-ui/core";
import { useEffect, useState } from "react";

interface Props {
  value: number;
  onChangeCommitted: (val: number | undefined) => void;
}

export function SliderWithNumberInput({ value, onChangeCommitted }: Props) {
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
            />
          </Grid>
        </Hidden>
        <Grid item>
          <Input
            value={number}
            margin="dense"
            onChange={(e) => {
              const int = e.target.value ? parseInt(e.target.value) : undefined;
              setNumber(int);
              onChangeCommitted(int);
            }}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              type: "number",
            }}
          />
        </Grid>
      </Grid>
    </div>
  );
}
