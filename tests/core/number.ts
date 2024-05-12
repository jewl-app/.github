import { toDecimal, fromDecimal, toNumber, fromNumber } from "@/core/number";
import { describe, it } from "mocha";
import assert from "assert";

describe("number", () => {

  it("Should convert a bigint to a decimal", () => {
    const input = 123456789n;
    const expected = "123.456789";
    const actual = toDecimal(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a large bigint to a decimal without losing precision", () => {
    const input = 12121212121212121212n;
    const expected = "12.121212121212121212";
    const actual = toDecimal(input, 18);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a negative bigint to a decimal", () => {
    const input = -123456789n;
    const expected = "-123.456789";
    const actual = toDecimal(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a decimal to a bigint", () => {
    const input = "123.456789";
    const expected = 123456789n;
    const actual = fromDecimal(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a negative decimal to a bigint", () => {
    const input = "-123.456789";
    const expected = -123456789n;
    const actual = fromDecimal(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a large decimal to a bigint", () => {
    const input = "12.1212121212121212121212";
    const expected = 12121212121212121212n;
    const actual = fromDecimal(input, 18);
    assert.strictEqual(actual, expected);
  });

  it("Should convert an empty decimal to a bigint", () => {
    const input = "";
    const expected = 0n;
    const actual = fromDecimal(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a bigint to a number", () => {
    const input = 123456789n;
    const expected = 123.456789;
    const actual = toNumber(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a large bigint to a number", () => {
    const input = 12121212121212121212n;
    const expected = 12.121212121212121;
    const actual = toNumber(input, 18);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a negative bigint to a number", () => {
    const input = -123456789n;
    const expected = -123.456789;
    const actual = toNumber(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a number to a bigint", () => {
    const input = 123.456789;
    const expected = 123456789n;
    const actual = fromNumber(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a negative number to a bigint", () => {
    const input = -123.456789;
    const expected = -123456789n;
    const actual = fromNumber(input, 6);
    assert.strictEqual(actual, expected);
  });

  it("Should convert a large number to a bigint", () => {
    const input = 12.121212121212121;
    const expected = 12121212121212121000n;
    const actual = fromNumber(input, 18);
    assert.strictEqual(actual, expected);
  });
});
