import { isNumber } from "lodash";
import { TextField } from "@material-ui/core";
import { formatMoney, unformat as unformatMoney } from "accounting";
import { useEffect, useState } from "react";

export function PriceInput({
  placeholder,
  onChange,
  value,
  ...props
}: {
  onChange: (val: number) => void;
  value?: number;
  placeholder?: string;
  label?: string;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value?.toString()}
      format={(val) => formatMoney(val, undefined, 0)}
      unformat={(val) => unformatMoney(String(val))}
      onChange={(val) => onChange(isNumber(val) ? val : parseInt(val || ""))}
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
