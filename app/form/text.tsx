import clsx from "clsx";
import type { ChangeEvent, ReactElement } from "react";
import React, { useCallback, useState } from "react";

export interface FormFieldTextMeta {
  readonly type: "text";
  readonly value?: string;
  readonly placeholder?: string;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly required?: boolean;
}

interface FormFieldTextProps {
  readonly fieldProps: FormFieldTextMeta;
  readonly onChange: (value: string) => void;
}

export default function FormFieldText(props: FormFieldTextProps): ReactElement {
  const [inputValue, setInputValue] = useState(props.fieldProps.value ?? "");
  const isRequired = props.fieldProps.required ?? false;
  const isEmpty = inputValue === "";

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    props.onChange(event.target.value);
  }, [setInputValue, props.onChange]);

  return (
    <div className={clsx(
      "flex items-center w-full p-2 rounded",
      "border-b-2 focus-within:border-emerald-600 focus-within:dark:border-emerald-500",
      "accent-emerald-600 dark:accent-emerald-500",
      "bg-slate-300 dark:bg-slate-600",
      "transition-colors",
      isRequired && isEmpty ? "border-red-500 dark:border-red-600" : "",
    )}>
      {props.fieldProps.prefix != null
        ? <span>{props.fieldProps.prefix}</span>
        : null}
      <input
        type="text"
        className="w-full bg-transparent focus:outline-none focus:ring-0"
        placeholder={props.fieldProps.placeholder}
        value={inputValue}
        onChange={onChange}
      />
      {props.fieldProps.suffix != null
        ? <span>{props.fieldProps.suffix}</span>
        : null}
    </div>
  );
}
