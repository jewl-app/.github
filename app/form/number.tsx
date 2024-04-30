import type { ReactElement } from "react";
import React, { useCallback, useMemo } from "react";
import type { FormFieldTextMeta } from "@/app/form/text";
import FormFieldText from "@/app/form/text";
import { stripNonDigits } from "@/core/string";

export interface FormFieldNumberMeta {
  readonly type: "number";
  readonly value?: number;
  readonly placeholder?: number;
  readonly decimals?: number;
  readonly min?: number;
  readonly max?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly required?: boolean;
}

interface FormFieldNumberProps {
  readonly fieldProps: FormFieldNumberMeta;
  readonly onChange: (value: number) => void;
}

export default function FormFieldNumber(props: FormFieldNumberProps): ReactElement {

  const onChange = useCallback((value: string) => {
    const noDecimals = props.fieldProps.decimals === 0 || props.fieldProps.decimals == null;
    const numberString = stripNonDigits(value, !noDecimals);
    const maximum = props.fieldProps.max ?? Number.POSITIVE_INFINITY;
    const minimum = props.fieldProps.min ?? Number.NEGATIVE_INFINITY;
    const number = Math.max(Math.min(Number(numberString), maximum), minimum);
    props.onChange(number);
  }, [props.fieldProps.decimals, props.onChange]);

  const innerProps = useMemo(() => {
    const decimals = props.fieldProps.decimals ?? 0;
    return {
      type: "text",
      value: props.fieldProps.value?.toFixed(decimals),
      placeholder: props.fieldProps.placeholder?.toFixed(decimals),
      prefix: props.fieldProps.prefix,
      suffix: props.fieldProps.suffix,
      required: props.fieldProps.required,
    } as FormFieldTextMeta;
  }, [props.fieldProps]);

  return <FormFieldText fieldProps={innerProps} onChange={onChange} />;
}
