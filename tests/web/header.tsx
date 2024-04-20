import { describe, it, beforeEach, afterEach } from "mocha";
import type { PropsWithChildren, ReactElement } from "react";
import React, { useMemo, useState } from "react";
import Header from "@/app/components/header";
import type { ReactTestRenderer } from "react-test-renderer";
import { create, act } from "react-test-renderer";
import { JSDOM } from "jsdom";
import assert from "assert";
import type { PublicKey } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import { WalletContext } from "@/app/hooks/wallet";

let escapedSetPublicKey: (publicKey: PublicKey | null) => void = () => { /* Empty */ };

const MockWalletProvider = (props: PropsWithChildren): ReactElement => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  escapedSetPublicKey = setPublicKey;

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
};

describe("header", () => {
  let jsdom: JSDOM = { } as JSDOM;
  let component: ReactTestRenderer = { } as ReactTestRenderer;

  beforeEach(() => {
    jsdom = new JSDOM("<!doctype html><html><body></body></html>");
    global.window = jsdom.window as never;
    component = create(<MockWalletProvider><Header /></MockWalletProvider>);
  });

  afterEach(() => {
    global.window = undefined as never;
  });

  it("Header should contain connect when not connected", async () => {
    await act(() => { escapedSetPublicKey(null); });
    const connectButton = component.root.findAllByProps({ children: "Connect" });
    assert.strictEqual(connectButton.length, 1);
  });

  it("Header should contain pubkey when connected", async () => {
    const publicKey = Keypair.generate().publicKey;
    await act(() => { escapedSetPublicKey(publicKey); });
    const prefix = publicKey.toBase58().slice(0, 4);
    const suffix = publicKey.toBase58().slice(-4);
    const text = `${prefix}...${suffix} (◎0.00)`;
    const connectButton = component.root.findAllByProps({ children: text });
    assert.strictEqual(connectButton.length, 1);
  });
});

