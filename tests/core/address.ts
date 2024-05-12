import { describe, it } from "mocha";
import assert from "assert";
import { PublicKey } from "@solana/web3.js";
import { shortAddress } from "@/core/address";

describe("address", () => {
  it("Should be able to shorten address", () => {
    const input = PublicKey.default;
    const expected = "1111...1111";
    const actual = shortAddress(input);
    assert.strictEqual(actual, expected);
  });

  it("Should be able to shorten address string", () => {
    const input = PublicKey.default.toBase58();
    const expected = "1111...1111";
    const actual = shortAddress(input);
    assert.strictEqual(actual, expected);
  });

  it("Should be able to shorten address to arbitrary num-chars", () => {
    const input = PublicKey.default;
    const expected = "111111...111111";
    const actual = shortAddress(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should only shorten to max 8 chars", () => {
    const input = PublicKey.default;
    const expected = "11111111...11111111";
    const actual = shortAddress(input, 64);
    assert.strictEqual(actual, expected);
  });

  it("Should only shorten to min 4 chars", () => {
    const input = PublicKey.default;
    const expected = "1111...1111";
    const actual = shortAddress(input, 1);
    assert.strictEqual(actual, expected);
  });

  it("Should be able to handle negative chars", () => {
    const input = PublicKey.default;
    const expected = "1111...1111";
    const actual = shortAddress(input, -1);
    assert.strictEqual(actual, expected);
  });

});
