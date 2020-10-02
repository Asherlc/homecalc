import { isNumber } from "lodash";
import { formatMoney, unformat as unformatMoney } from "accounting";
import { useState } from "react";

export function PriceInput({
  placeholder,
  onChange,
  value,
}: {
  onChange: (val: number) => void;
  value?: number;
  placeholder?: string;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value?.toString()}
      format={formatMoney}
      unformat={(val) => unformatMoney(String(val))}
      onChange={(val) => onChange(isNumber(val) ? val : parseInt(val || ""))}
    />
  );
}

interface TextInputProps {
  onChange: (val: string | number | undefined) => void;
  value?: string | number | undefined;
  placeholder?: string;
  format?: (val: string | number) => string | number;
  unformat?: (val: string | number) => string | number;
}
export function TextInput({
  onChange,
  format = (val) => val,
  unformat = (val) => val,
  value,
  ...props
}: TextInputProps) {
  const [val, setVal] = useState(value);

  return (
    <input
      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
      value={format(val || "")}
      type="text"
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
