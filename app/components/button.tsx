import clsx from "clsx";
import React from "react";
import { PropsWithChildren, ReactElement } from "react";

interface BaseProps extends PropsWithChildren {
  className?: string
}

interface ButtonProps extends BaseProps {
  onClick: () => void;
}

interface LinkProps extends BaseProps {
  href: string;
}

export default function Button(props: ButtonProps | LinkProps): ReactElement {
  const content = (
    <div className="block w-full h-full group-hover:-translate-y-1 transition-transform">
      {props.children}
    </div>
  );

  if ("href" in props) {
    return (
      <a className={clsx("group", props.className)} href={props.href} target="_blank" rel="noreferrer onopener">
        {content}
      </a>
    );
  }

  return (
    <button className={clsx("group", props.className)} type="button" onClick={props.onClick}>
      {content}
    </button>
  );
}
