import React from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
import type { ReactElement } from "react";

interface IconProps {
  icon: IconDefinition;
  className?: string;
}

export default function FontIcon(props: IconProps): ReactElement {
  const [
    width,
    height,
    _ligatures,
    _unicode,
    iconPathData,
  ] = props.icon.icon;

  const paths = typeof iconPathData === "string" ? [iconPathData] : iconPathData;

  return (
    <svg className={props.className} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${width} ${height}`}>
      {paths.map((path, index) => <path fill="currentColor" key={index} d={path} />)}
    </svg>
  );
}
