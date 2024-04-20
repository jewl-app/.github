import { Connection } from "@solana/web3.js";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useMemo } from "react";

const fallbackUrl = "https://api.devnet.solana.com";

export interface UseConnection {
  readonly connection: Connection;
}

export const ConnectionContext = createContext<UseConnection>({
  connection: new Connection(fallbackUrl, "confirmed"),
});

export function useConnection (): UseConnection {
  return useContext(ConnectionContext);
}

export default function ConnectionProvider (props: PropsWithChildren): ReactElement {
  const rpcUrl = useMemo(() => {
    if (!Object.hasOwn(global, "document")) { return fallbackUrl; }
    if (document == null) { return fallbackUrl; }
    const tag = document.querySelector("meta[property='rpc-url']");
    if (tag == null) { return fallbackUrl; }
    return tag.getAttribute("content") ?? fallbackUrl;
  }, []);

  const context = useMemo(() => ({
    connection: new Connection(rpcUrl, "confirmed"),
  }), [rpcUrl]);

  return <ConnectionContext.Provider value={context}>{props.children}</ConnectionContext.Provider>;
}
