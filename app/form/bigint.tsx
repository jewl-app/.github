import type { ReactElement } from "react";
import React, { useCallback, useMemo } from "react";
import type { FormFieldTextMeta } from "@/app/form/text";
import FormFieldText from "@/app/form/text";
import { fromDecimal, toDecimal } from "@/core/number";

export interface FormFieldBigIntMeta {
  readonly type: "bigint";
  readonly value?: bigint;
  readonly placeholder?: bigint;
  readonly decimals?: number;
  readonly min?: bigint;
  readonly max?: bigint;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly required?: boolean;
}

interface FormFieldBigIntProps {
  readonly fieldProps: FormFieldBigIntMeta;
  readonly onChange: (value: bigint) => void;
}

export default function FormFieldBigInt(props: FormFieldBigIntProps): ReactElement {
  const decimals = props.fieldProps.decimals ?? 0;

  const onChange = useCallback((value: string) => {
    let integer = fromDecimal(value, decimals);
    if (props.fieldProps.max != null && integer > props.fieldProps.max) {
      integer = props.fieldProps.max;
    }
    if (props.fieldProps.min != null && integer < props.fieldProps.min) {
      integer = props.fieldProps.min;
    }
    props.onChange(integer);
  }, [props.fieldProps.decimals, props.onChange]);

  const innerProps = useMemo(() => {
    return {
      type: "text",
      value: props.fieldProps.value != null ? toDecimal(props.fieldProps.value, decimals) : undefined,
      placeholder: props.fieldProps.placeholder != null ? toDecimal(props.fieldProps.placeholder, decimals) : undefined,
      prefix: props.fieldProps.prefix,
      suffix: props.fieldProps.suffix,
      required: props.fieldProps.required,
    } as FormFieldTextMeta;
  }, [props.fieldProps]);

  return <FormFieldText fieldProps={innerProps} onChange={onChange} />;
}
