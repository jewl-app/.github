import type { ChangeEvent, ReactElement } from "react";
import React, { useMemo, useCallback } from "react";

export interface FormFieldCheckboxMeta {
  readonly type: "checkbox";
  readonly options: Array<string>;
  readonly value?: Array<string>;
  readonly required?: boolean;
}

interface FormFieldCheckboxProps {
  readonly fieldProps: FormFieldCheckboxMeta;
  readonly onChange: (value: Array<string>) => void;
}

export default function FormFieldCheckbox(props: FormFieldCheckboxProps): ReactElement {

  const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (props.fieldProps.options == null) { return; }
    const values = props.fieldProps.value ?? [];
    const value = event.target.value;
    const isChecked = event.target.checked;
    if (isChecked) {
      const newValues = [...values, value];
      props.onChange(newValues);
    } else {
      const newValues = values.filter(x => x !== value);
      props.onChange(newValues);
    }
  }, [props.fieldProps.options, props.fieldProps.value, props.onChange]);

  const options = useMemo(() => {
    return props.fieldProps.options.map(option => {
      const isChecked = props.fieldProps.value?.includes(option);
      return (
        <div key={option}>
          <input type="checkbox" className="accent-emerald-600 dark:accent-emerald-500" value={option} checked={isChecked} onChange={onChange} />
          <label>{option}</label>
        </div>
      );
    });
  }, [props.fieldProps.options, props.fieldProps.value, onChange]);

  return <>{options}</>;
}
