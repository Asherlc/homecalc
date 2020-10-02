interface TextInputProps {
  onChange: (val: string | undefined) => void;
  value?: string;
  placeholder?: string;
}
export function TextInput({ onChange, ...props }: TextInputProps) {
  return (
    <input
      className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
      type="text"
      onChange={(event) => {
        const caret = event.target.selectionStart;
        const element = event.target;
        window.requestAnimationFrame(() => {
          element.selectionStart = caret;
          element.selectionEnd = caret;
        });
        onChange(event.target.value);
      }}
      {...props}
    />
  );
}
