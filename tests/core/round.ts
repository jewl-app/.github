import { round, ceil, floor } from "@/core/round";
import { describe, it } from "mocha";
import assert from "assert";

describe("round", () => {
  it("Should round to nearest 0.1", () => {
    const actual = round(2.12, 0.1);
    const expected = 2.1;
    assert.strictEqual(actual, expected);
  });

  it("Should round to nearest 0", () => {
    const actual = round(2.12, 0);
    const expected = 2;
    assert.strictEqual(actual, expected);
  });

  it("Should round to nearest 1", () => {
    const actual = round(2.12);
    const expected = 2;
    assert.strictEqual(actual, expected);
  });

  it("Should round to nearest 10", () => {
    const actual = round(2.12, 10);
    const expected = 0;
    assert.strictEqual(actual, expected);
  });

  it("Should ceil to nearest 0.1", () => {
    const actual = ceil(2.12, 0.1);
    const expected = 2.2;
    assert.strictEqual(actual, expected);
  });

  it("Should ceil to nearest 0", () => {
    const actual = ceil(2.12, 0);
    const expected = 3;
    assert.strictEqual(actual, expected);
  });

  it("Should ceil to nearest 1", () => {
    const actual = ceil(2.12);
    const expected = 3;
    assert.strictEqual(actual, expected);
  });

  it("Should ceil to nearest 10", () => {
    const actual = ceil(2.12, 10);
    const expected = 10;
    assert.strictEqual(actual, expected);
  });

  it("Should floor to nearest 0.1", () => {
    const actual = floor(2.12, 0.1);
    const expected = 2.1;
    assert.strictEqual(actual, expected);
  });

  it("Should floor to nearest 0", () => {
    const actual = floor(2.12, 0);
    const expected = 2;
    assert.strictEqual(actual, expected);
  });

  it("Should floor to nearest 1", () => {
    const actual = floor(2.12);
    const expected = 2;
    assert.strictEqual(actual, expected);
  });

  it("Should floor to nearest 10", () => {
    const actual = floor(2.12, 10);
    const expected = 0;
    assert.strictEqual(actual, expected);
  });

});
