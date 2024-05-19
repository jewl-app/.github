import { range, interval, clamp, nonNull } from "@/core/array";
import { describe, it } from "mocha";
import assert from "assert";

describe("array", () => {
  it("Range should be properly created", () => {
    const actual = range(1, 10);
    const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    assert.deepStrictEqual(actual, expected);
  });

  it("Range with step should be properly created", () => {
    const actual = range(1, 10, 2);
    const expected = [1, 3, 5, 7, 9];
    assert.deepStrictEqual(actual, expected);
  });

  it("Interval should be properly created", () => {
    const actual = interval(10);
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    assert.deepStrictEqual(actual, expected);
  });

  it("Interval with step should be properly created", () => {
    const actual = interval(10, 2);
    const expected = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];
    assert.deepStrictEqual(actual, expected);
  });

  it("Clamp should return the value clamped to the the range", () => {
    assert.strictEqual(clamp(5, 2, 4), 4);
    assert.strictEqual(clamp(4, 2, 4), 4);
    assert.strictEqual(clamp(3, 2, 4), 3);
    assert.strictEqual(clamp(2, 2, 4), 2);
    assert.strictEqual(clamp(1, 2, 4), 2);
  });

  it("NonNull should filter out null and undefined values from array", () => {
    const actual = [0, 1, null, undefined, 2, null, undefined, 3, null, undefined]
      .filter(nonNull);
    const expected = [0, 1, 2, 3];
    assert.deepStrictEqual(actual, expected);
  });

  it("MapNonNull should skip over null values from array and transform the non-nul values", () => {
    const actual = [0, 1, null, 2, null, 3]
      .mapNonNull(x => x + 1);
    const expected = [1, 2, null, 3, null, 4];
    assert.deepStrictEqual(actual, expected);
  });
});
