import clsx from "clsx";
import type { ReactElement } from "react";
import React from "react";


export interface FormFieldInfoMeta {
  readonly type: "info";
  readonly value?: string;
  readonly warning?: boolean;
}

interface FormFieldInfoProps {
  readonly fieldProps: FormFieldInfoMeta;
}

export default function FormFieldInfo(props: FormFieldInfoProps): ReactElement {
  const isWarning = props.fieldProps.warning != null && props.fieldProps.warning;

  return (
    <div className={clsx(
      "w-full text-pretty break-words",
      isWarning ? "text-yellow-600 dark:text-yellow-300" : "",
    )}>
      {props.fieldProps.value}
    </div>
  );
}
