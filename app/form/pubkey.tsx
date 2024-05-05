import type { ReactElement } from "react";
import React, { useCallback, useMemo } from "react";
import type { FormFieldTextMeta } from "@/app/form/text";
import FormFieldText from "@/app/form/text";
import { PublicKey } from "@solana/web3.js";

export interface FormFieldPubkeyMeta {
  readonly type: "pubkey";
  readonly value?: PublicKey;
  readonly placeholder?: PublicKey;
  readonly required?: boolean;
}

interface FormFieldPubkeyProps {
  readonly fieldProps: FormFieldPubkeyMeta;
  readonly onChange: (value: PublicKey) => void;
}

export default function FormFieldNumber(props: FormFieldPubkeyProps): ReactElement {

  const onChange = useCallback((value: string) => {
    // TODO: what to do if invalid?
    // Parse as pubkey?
    // allow empty if not required
    props.onChange(new PublicKey(value));
  }, [props.fieldProps.required, props.onChange]);

  const innerProps = useMemo(() => {
    return {
      type: "text",
      value: props.fieldProps.value?.toBase58(),
      placeholder: props.fieldProps.placeholder?.toBase58(),
      required: props.fieldProps.required,
    } as FormFieldTextMeta;
  }, [props.fieldProps]);

  return <FormFieldText fieldProps={innerProps} onChange={onChange} />;
}
