import type { ChangeEvent, ReactElement } from "react";
import React, { useCallback, useMemo } from "react";


export interface FormFieldRadioboxMeta {
  readonly type: "radiobox";
  readonly options: Array<string>;
  readonly value?: string;
}

interface FormFieldRadioboxProps {
  readonly fieldProps: FormFieldRadioboxMeta;
  readonly onChange: (value: string) => void;
}

export default function FormFieldRadiobox(props: FormFieldRadioboxProps): ReactElement {

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  }, [props.onChange]);

  const options = useMemo(() => {
    return props.fieldProps.options.map(option => {
      const isChecked = props.fieldProps.value === option;
      return (
        <div key={option}>
          <input type="radio" className="accent-emerald-600 dark:accent-emerald-500" value={option} checked={isChecked} onChange={onChange} />
          <label className="pl-1">{option}</label>
        </div>
      );
    });
  }, [props.fieldProps.options, props.fieldProps.value, onChange]);

  return <>{options}</>;
}
