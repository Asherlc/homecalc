import { TextField, TextFieldProps } from "@material-ui/core";
import NumberFormat from "react-number-format";
import { useEffect, useState } from "react";

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

function PriceInput({ inputRef, onChange, ...props }: NumberFormatCustomProps) {
  return (
    <NumberFormat
      {...props}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
      prefix="$"
    />
  );
}

export function PriceField({ ...props }: TextFieldProps) {
  return (
    <TextField
      InputProps={{
        inputComponent: PriceInput as any,
      }}
      {...props}
    />
  );
}

interface TextInputProps {
  onChange: (val: string | number | undefined) => void;
  value?: string | number | undefined;
  placeholder?: string;
  format?: (val: string | number) => string | number;
  unformat?: (val: string | number) => string | number;
  label?: string;
}
export function TextInput({
  onChange,
  format = (val) => val,
  unformat = (val) => val,
  value,
  ...props
}: TextInputProps) {
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  return (
    <TextField
      value={format(val || "")}
      inputProps={{
        "data-lpignore": true,
      }}
      onChange={(event) => {
        const caret = event.target.selectionStart;
        const element = event.target;
        window.requestAnimationFrame(() => {
          element.selectionStart = caret;
          element.selectionEnd = caret;
        });
        const unformatted = unformat(event.target.value || "");

        setVal(unformatted);
        onChange(unformatted);
      }}
      {...props}
    />
  );
}
