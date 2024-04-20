import { describe, it } from "mocha";
import assert from "assert";
import { Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { convertFromBigInt, convertToBigInt } from "@/core/coder";

describe("coder", () => {
  const pubkey = Keypair.generate().publicKey;
  const bn = {
    publicKey: pubkey,
    number: 1000000,
    string: "1000000",
    boolean: true,
    bn: new BN(1000000),
  };

  const bigint = {
    publicKey: pubkey,
    number: 1000000,
    string: "1000000",
    boolean: true,
    bn: 1000000n,
  };

  it("Should be able to convert object from BN to BigInt", () => {
    const converted = convertToBigInt(bn);
    assert.deepStrictEqual(converted, bigint);
  });

  it("Should be able to convert object from BigInt to BN", () => {
    const converted = convertFromBigInt(bigint);
    assert.deepStrictEqual(converted, bn);
  });
});
