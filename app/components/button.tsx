import clsx from "clsx";
import React from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, PropsWithChildren, ReactElement } from "react";

interface BaseProps extends PropsWithChildren {
  className?: string;
  outerClassName?: string;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type Props = ButtonProps | LinkProps;

export default function Button(props: Props): ReactElement {
  const { children, className, outerClassName, ...rest } = props;

  let disabled = false;
  if ("disabled" in rest) {
    disabled = rest.disabled ?? false;
  }

  const content = (
    <div className={clsx(
      "block w-full h-full transition-transform",
      disabled ? "" : "group-hover:-translate-y-1",
      className,
    )}>
      {children}
    </div>
  );

  if ("href" in rest) {
    delete rest.target;
    delete rest.rel;
    return (
      <a {...rest} className={clsx("group disabled:cursor-not-allowed", outerClassName)} target="_blank" rel="noreferrer noopener" >
        {content}
      </a>
    );
  }

  delete rest.type;
  return (
    <button {...rest} className={clsx("group disabled:cursor-not-allowed", outerClassName)} type="button">
      {content}
    </button>
  );

}
