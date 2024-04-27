import Provider from "@/app/components/provider";
import { PublicKey } from "@solana/web3.js";
import React, { PropsWithChildren, ReactElement, useMemo, useState } from "react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import { WalletContext } from "@/app/hooks/wallet";
import { JSDOM } from "jsdom";

export let jsdom: JSDOM = { } as JSDOM;
export let context: RenderResult = { } as RenderResult;
export let setPublicKey: (publicKey: PublicKey | null) => void = () => { /* Empty */ };

function MockWalletProvider(props: PropsWithChildren): ReactElement {
  const [publicKey, setMockPublicKey] = useState<PublicKey | null>(null);

  setPublicKey = setMockPublicKey;

  const wallet = useMemo(() => {
    return {
      wallets: [],
      wallet: null,
      account: null,
      publicKey,
      connect: async () => Promise.reject(new Error("Not implemented")),
      disconnect: async () => Promise.reject(new Error("Not implemented")),
    };
  }, [publicKey]);

  return <WalletContext.Provider value={wallet}>{props.children}</WalletContext.Provider>;
}

const testProviders = [MockWalletProvider];

function TestWrapper(props: PropsWithChildren): ReactElement {
  return <Provider providers={testProviders}>{props.children}</Provider>;
}

export function startTestRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  jsdom = new JSDOM("<!doctype html><html><body></body></html>");
  global.window = jsdom.window as never;
  global.document = jsdom.window.document;
  window.console = global.console;
  context = render(ui, { wrapper: TestWrapper, ...options });
}
