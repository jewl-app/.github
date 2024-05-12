import type { ReactElement } from "react";
import React, { useMemo } from "react";
import type { FormFieldCheckboxMeta } from "@/app/form/checkbox";
import FormFieldCheckbox from "@/app/form/checkbox";
import type { FormFieldInfoMeta } from "@/app/form/info";
import FormFieldInfo from "@/app/form/info";
import type { FormFieldNumberMeta } from "@/app/form/number";
import FormFieldNumber from "@/app/form/number";
import type { FormFieldRadioboxMeta } from "@/app/form/radiobox";
import FormFieldRadiobox from "@/app/form/radiobox";
import type { FormFieldTextMeta } from "@/app/form/text";
import FormFieldText from "@/app/form/text";
import type { FormFieldChoiceMeta } from "@/app/form/choice";
import FormFieldChoice from "@/app/form/choice";
import type { FormFieldPubkeyMeta } from "@/app/form/pubkey";
import FormFieldPubkey from "@/app/form/pubkey";
import type { FormFieldBigIntMeta } from "@/app/form/bigint";
import FormFieldBigInt from "@/app/form/bigint";

export type FormFieldMeta = [
  FormFieldInfoMeta, FormFieldTextMeta,
  FormFieldNumberMeta, FormFieldCheckboxMeta,
  FormFieldRadioboxMeta, FormFieldChoiceMeta,
  FormFieldPubkeyMeta, FormFieldBigIntMeta,
][number] & {
  title: string;
};

interface FormFieldInnerProps {
  readonly fieldProps: FormFieldMeta;
  readonly onChange: (value: FormFieldMeta["value"]) => void;
}

export default function FormField(props: FormFieldInnerProps): ReactElement {
  const content = useMemo(() => {
    switch (props.fieldProps.type) {
      case "info": return <FormFieldInfo fieldProps={props.fieldProps} />;
      case "text": return <FormFieldText fieldProps={props.fieldProps} onChange={props.onChange} />;
      case "number": return <FormFieldNumber fieldProps={props.fieldProps} onChange={props.onChange} />;
      case "checkbox": return <FormFieldCheckbox fieldProps={props.fieldProps} onChange={props.onChange} />;
      case "radiobox": return <FormFieldRadiobox fieldProps={props.fieldProps} onChange={props.onChange} />;
      case "choice": return <FormFieldChoice fieldProps={props.fieldProps} onChange={props.onChange} />;
      case "pubkey": return <FormFieldPubkey fieldProps={props.fieldProps} onChange={props.onChange} />;
      case "bigint": return <FormFieldBigInt fieldProps={props.fieldProps} onChange={props.onChange} />;
      default: return null;
    }
  }, [props]);

  return (
    <>
      <div className="px-5 pt-2 font-bold">{props.fieldProps.title}</div>
      <div className="px-5 pb-2 flex flex-wrap gap-2">{content}</div>
    </>
  );
}
