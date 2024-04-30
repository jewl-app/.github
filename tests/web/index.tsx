import Provider from "@/app/components/provider";
import type { PublicKey } from "@solana/web3.js";
import type { PropsWithChildren, ReactElement } from "react";
import React, { useMemo, useState } from "react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
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

export function startTestRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): void {
  jsdom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
  });
  global.window = jsdom.window as never;
  global.document = jsdom.window.document;
  global.self = global.window;
  window.console = global.console;
  window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { /* Empty */ },
    removeListener: () => { /* Empty */ },
    addEventListener: () => { /* Empty */ },
    removeEventListener: () => { /* Empty */ },
    dispatchEvent: () => true,
  });
  const originalErr = console.error.bind(console.error);
  console.error = (msg: { toString: () => string }) => {
    if (msg.toString().includes("Warning: ")) {
      return;
    }
    originalErr(msg);
  };
  context = render(ui, { wrapper: TestWrapper, ...options });
}
