import { Hidden, Input, Slider, Grid, InputProps } from "@material-ui/core";
import { ComponentType, useEffect, useState } from "react";

interface Props {
  value: number;
  onChangeCommitted?: (val: number) => void;
  onChange?: (val: number) => void;
  max?: number;
  min?: number;
  inputComponent?: ComponentType<InputProps>;
}

export function SliderWithNumberInput({
  value,
  onChangeCommitted,
  onChange,
  min = 0,
  max = 100,
  inputComponent: InputComponent = Input,
}: Props): JSX.Element {
  const [number, setNumber] = useState(value);

  useEffect(() => {
    setNumber(value);
  }, [value]);

  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        <Hidden smDown>
          <Grid item xs>
            <Slider
              value={number}
              onChangeCommitted={(e, val) => {
                if (onChangeCommitted) {
                  onChangeCommitted(val as number);
                }
              }}
              onChange={(e, val) => {
                setNumber(val as number);
                if (onChange) {
                  onChange(val as number);
                }
              }}
              min={min}
              max={max}
            />
          </Grid>
        </Hidden>
        <Grid item>
          <InputComponent
            value={number}
            margin="dense"
            onChange={(e) => {
              const int = e.target.value ? parseInt(e.target.value) : undefined;
              if (!int) {
                return;
              }
              setNumber(int);
              if (onChange) {
                onChange(int);
              } else if (onChangeCommitted) {
                onChangeCommitted(int);
              }
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
