import { describe, it, beforeEach } from "mocha";
import React from "react";
import Header from "@/app/components/header";
import assert from "assert";
import { Keypair } from "@solana/web3.js";
import { setPublicKey, startTestRender, context } from "@/tests/web";

describe("header", () => {

  beforeEach(() => {
    startTestRender(<Header />);
  });

  it("Header should contain connect when not connected", async () => {
    setPublicKey(null);
    const connectButton = await context.findByRole("button", { name: "Connect" });
    assert.ok(connectButton);
  });

  it("Header should contain pubkey when connected", async () => {
    const publicKey = Keypair.generate().publicKey;
    setPublicKey(publicKey);
    const prefix = publicKey.toBase58().slice(0, 4);
    const suffix = publicKey.toBase58().slice(-4);
    const text = `${prefix}...${suffix} (◎0.00)`;
    const connectButton = await context.findByRole("button", { name: text });
    assert.ok(connectButton);
  });
});

