import type { ReactElement } from "react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePopup } from "@/app/hooks/popup";
import Spinner from "@/app/components/spinner";
import type { FormFieldMeta } from "@/app/form/field";
import FormField from "@/app/form/field";
import { useCluster } from "@/app/hooks/cluster";
import Button from "@/app/components/button";
import { useTransaction } from "@/app/hooks/transaction";

type FormState = "entry" | "loading" | "success" | "failure";

export interface FormProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly fields: Array<FormFieldMeta>;
  readonly button?: string;
  readonly onComplete?: (fields: Array<FormFieldMeta>) => Promise<string | null>;
  readonly onChange?: (fields: Array<FormFieldMeta>) => Promise<Array<FormFieldMeta>>;
}

export default function Form(props: FormProps): ReactElement {
  const { closePopup, setCloseOnBackground } = usePopup();
  const { cluster } = useCluster();
  const [state, setState] = useState<FormState>("entry");
  const [response, setResponse] = useState<string | null>(null);
  const [fields, setFields] = useState<Array<FormFieldMeta>>(props.fields);
  const { state: transactionState } = useTransaction();

  const onFieldChange = useCallback((index: number) => {
    return (value: FormFieldMeta["value"]) => {
      const newFields = [...fields];
      newFields[index] = { ...fields[index], value } as FormFieldMeta;
      setFields(newFields);
      if (props.onChange != null) {
        props.onChange(newFields)
          .then(setFields)
          .catch(console.error);
      }
    };
  }, [fields, props.onChange, setFields]);

  const fieldNodes = useMemo(() => {
    return fields.map((field, index) => {
      return <FormField key={field.title} fieldProps={field} onChange={onFieldChange(index)} />;
    });
  }, [fields]);

  const spinnerMessage = useMemo(() => {
    switch (transactionState.step) {
      case "preparing": return "Preparing transaction...";
      case "signing": return "Signing transaction...";
      case "sending": return "Sending transaction...";
      case "confirming": return "Confirming transaction...";
      default: return undefined;
    }
  }, [transactionState]);

  const content = useMemo(() => {
    switch (state) {
      case "entry": return <div className="flex flex-col w-full">{fieldNodes}</div>;
      default: return <Spinner size="large" message={spinnerMessage} state={state} className="my-8 mx-auto" />;
    }
  }, [state, fieldNodes, spinnerMessage]);

  const buttonClicked = useCallback(() => {
    if (props.onComplete == null) { closePopup(); return; }
    setState("loading");
    setCloseOnBackground(false);
    props.onComplete(fields)
      .then(hash => {
        setState("success");
        setResponse(hash);
        setCloseOnBackground(true);
      })
      .catch(error => {
        setState("failure");
        setResponse(`${error}`);
        setCloseOnBackground(true);
        console.error(error);
      });
  }, [props.onComplete, fields, setState, setResponse]);

  const primaryButton = useMemo(() => {
    const tw = "px-4 py-2 w-48 self-center bg-emerald-600 dark:bg-emerald-500 text-slate-100 rounded-full font-bold";
    switch (state) {
      case "entry": return <Button className={tw} onClick={buttonClicked}>{props.button ?? "Continue"}</Button>;
      case "success": return <Button className={tw} onClick={closePopup}>Close</Button>;
      case "failure": return <Button className={tw} onClick={buttonClicked}>Retry</Button>;
      default: return null;
    }
  }, [state, props.button, buttonClicked]);

  const secondaryButton = useMemo(() => {
    const tw = "px-4 py-2 self-center text-emerald-600 dark:text-emerald-500 rounded-full font-bold";
    const cancel = <Button className={tw} onClick={closePopup}>Cancel</Button>;
    switch (state) {
      case "entry": return cancel;
      case "failure": return cancel;
      default: return null;
    }
  }, [state, closePopup]);

  const buttons = useMemo(() => {
    if (secondaryButton == null && primaryButton == null) { return null; }
    return (
      <div className="flex flex-row justify-center py-4">
        {primaryButton}
        {secondaryButton}
      </div>
    );
  }, [secondaryButton, primaryButton]);

  const accessory = useMemo(() => {
    if (response == null) { return null; }
    if (response === "") { return null; }
    if (cluster == null) { return null; }
    switch (state) {
      case "success": return <a className="self-center px-10 hover:underline" href={`https://solscan.io/tx/${response}?cluster=${cluster}`} target="_blank" rel="noreferrer">View on Solscan</a>;
      case "failure": return <div className="self-center px-10">{response}</div>;
      default: return null;
    }
  }, [response, state, cluster]);

  useEffect(() => {
    if (props.onChange == null) { return; }
    props.onChange(props.fields)
      .then(setFields)
      .catch(console.error);
  }, [props.onChange, props.fields]);

  return (
    <>
      {props.title == null ? null : <div className="text-2xl font-bold pt-2 px-4">{props.title}</div>}
      {props.subtitle == null ? null : <div className="text-xl pb-2 px-4">{props.subtitle}</div>}
      {content}
      {accessory}
      {buttons}
    </>
  );
}
