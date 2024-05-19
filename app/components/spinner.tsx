import type { ReactElement } from "react";
import React, { useMemo } from "react";
import clsx from "clsx";
import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { faCheckCircle, faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faCircleNotch, faHourglass3 } from "@fortawesome/free-solid-svg-icons";
import FontIcon from "@/app/components/font";

interface SpinnerProps {
  readonly state?: "loading" | "success" | "failure";
  readonly size?: "nano" | "mini" | "small" | "medium" | "large" | "huge";
  readonly type?: "hourglass" | "circle";
  readonly message?: string;
  readonly className?: string;
}

function animationForType(type: SpinnerProps["type"]): string {
  switch (type) {
    case "hourglass": return "animate-hourglass";
    default: return "animate-spin";
  }
}

function iconForType(type: SpinnerProps["type"]): IconDefinition {
  switch (type) {
    case "hourglass": return faHourglass3;
    default: return faCircleNotch;
  }
}

export default function Spinner(props: SpinnerProps): ReactElement {

  const size = useMemo(() => {
    switch (props.size) {
      case "nano": return "w-2 h-2";
      case "mini": return "w-4 h-4";
      case "medium": return "w-12 h-12";
      case "large": return "w-16 h-16";
      case "huge": return "w-24 h-24";
      default: return "w-8 h-8";
    }
  }, [props.size]);

  const animation = useMemo(() => {
    if (props.state == null) { return animationForType(props.type); }
    if (props.state === "loading") { return animationForType(props.type); }
    return "";
  }, [props.type, props.state]);

  const icon = useMemo(() => {
    switch (props.state) {
      case "success": return faCheckCircle;
      case "failure": return faCircleXmark;
      default: return iconForType(props.type);
    }
  }, [props.state, props.type]);

  return (
    <div role="status" className={clsx("flex flex-col items-center gap-1", props.className)}>
      <FontIcon icon={icon} className={clsx("text-emerald-600 dark:text-emerald-500", size, animation)} />
      {props.message != null ? <span className="m-2">{props.message}</span> : null}
    </div>
  );
}
