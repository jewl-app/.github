import type { ComponentType, PropsWithChildren, ReactElement } from "react";
import React from "react";

interface ProviderProps extends PropsWithChildren {
  readonly providers: Array<ComponentType<PropsWithChildren>>;
}

export default function Provider(props: ProviderProps): ReactElement {
  if (props.providers.length === 0) { return <>{props.children}</>; }
  const Tag = props.providers[0];
  let children = props.children;
  if (props.providers.length > 1) {
    const next = props.providers.slice(1);
    children = <Provider providers={next}>{props.children}</Provider>;
  }
  return <Tag>{children}</Tag>;
}
