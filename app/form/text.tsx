import clsx from "clsx";
import type { ChangeEvent, ReactElement } from "react";
import React, { useCallback, useMemo } from "react";

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
  const isRequired = props.fieldProps.required ?? false;
  const isEmpty = props.fieldProps.value === "";

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  }, [props.onChange]);

  const value = useMemo(() => {
    if (props.fieldProps.value == null) { return ""; }
    const prefix = props.fieldProps.prefix ?? "";
    const suffix = props.fieldProps.suffix ?? "";
    return `${prefix}${props.fieldProps.value}${suffix}`;
  }, [props.fieldProps.value]);

  return (
    <input
      type="text"
      className={clsx(
        "w-full p-2 rounded bg-slate-300 dark:bg-slate-600 accent-emerald-600 dark:accent-emerald-500 border-b-2 border-transparent focus:border-emerald-600 focus:dark:border-emerald-500 focus:outline-none focus:ring-0 transition-colors",
        isRequired && isEmpty ? "border-red-200 dark:border-red-600" : "",
      )}
      placeholder={props.fieldProps.placeholder}
      value={value}
      onChange={onChange}
    />
  );
}
