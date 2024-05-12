import type { ReactElement, ChangeEvent } from "react";
import { useCallback, useMemo } from "react";


export interface FormFieldChoiceMeta {
  readonly type: "choice";
  readonly options: Record<string, string>;
  readonly value?: string;
  readonly required?: boolean;
}

interface FormFieldChoiceProps {
  readonly fieldProps: FormFieldChoiceMeta;
  readonly onChange: (value: string) => void;
}

export default function FormFieldChoice(props: FormFieldChoiceProps): ReactElement {

  const onChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    props.onChange(event.target.value);
  }, [props.onChange]);

  const options = useMemo(() => {
    return Object.entries(props.fieldProps.options).map(([id, value]) => {
      return <option key={id} value={id}>{value}</option>;
    });
  }, [props.fieldProps.options, props.fieldProps.value, onChange]);

  return (
    <select value={props.fieldProps.value} >
      {options}
    </select>
  );
}
