import { stripNonDigits, formatLargeNumber, formatPriceDelta } from "@/core/string";
import { describe, it } from "mocha";
import assert from "assert";

describe("string", () => {
  it("Should strip non-numeric characters from a string", () => {
    const input = "1a23456ab7890a.4185";
    const expected = "12345678904185";
    const actual = stripNonDigits(input);
    assert.strictEqual(actual, expected);
  });

  it("Should strip non-numeric a large number with decimal", () => {
    const input = "1a23456ab7890a.4185";
    const expected = "1234567890.4185";
    const actual = stripNonDigits(input, true);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 1 figure number", () => {
    const input = 1;
    const expected = "1.00";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 2 figure number", () => {
    const input = 12;
    const expected = "12.00";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 3 figure number", () => {
    const input = 123;
    const expected = "123.00";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 4 figure number", () => {
    const input = 1121;
    const expected = "1.1k";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 5 figure number", () => {
    const input = 11212;
    const expected = "11.2k";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 6 figure number", () => {
    const input = 112120;
    const expected = "112.1k";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 7 figure number", () => {
    const input = 1121200;
    const expected = "1.1M";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 8 figure number", () => {
    const input = 11212000;
    const expected = "11.2M";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 9 figure number", () => {
    const input = 112120000;
    const expected = "112.1M";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 10 figure number", () => {
    const input = 1121200000;
    const expected = "1.1B";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 11 figure number", () => {
    const input = 11212000000;
    const expected = "11.2B";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 12 figure number", () => {
    const input = 112120000000;
    const expected = "112.1B";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a 13 figure number", () => {
    const input = 1121200000000;
    const expected = "1121.2B";
    const actual = formatLargeNumber(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a large negative price delta", () => {
    const input = -0.02;
    const expected = "▼▼▼";
    const actual = formatPriceDelta(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a medium negative price delta", () => {
    const input = -0.006;
    const expected = "▼▼";
    const actual = formatPriceDelta(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a small negative price delta", () => {
    const input = -0.0006;
    const expected = "▼";
    const actual = formatPriceDelta(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a large positive price delta", () => {
    const input = 0.02;
    const expected = "▲▲▲";
    const actual = formatPriceDelta(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a medium positive price delta", () => {
    const input = 0.006;
    const expected = "▲▲";
    const actual = formatPriceDelta(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a small positive price delta", () => {
    const input = 0.0006;
    const expected = "▲";
    const actual = formatPriceDelta(input);
    assert.strictEqual(actual, expected);
  });

  it("Should format a zero price delta", () => {
    const input = 0;
    const expected = "";
    const actual = formatPriceDelta(input);
    assert.strictEqual(actual, expected);
  });
});
