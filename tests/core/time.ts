import { unix, isAfter, isBefore, isEqual } from "@/core/time";
import assert from "assert";
import { describe, it, beforeEach, afterEach } from "mocha";
import type { SinonFakeTimers } from "sinon";
import { useFakeTimers } from "sinon";

describe("time", () => {
  let clock = { } as SinonFakeTimers;

  beforeEach(() => {
    clock = useFakeTimers({ now: 1577836812345 });
  });

  afterEach(() => {
    clock.restore();
  });

  it("Should create a valid unix timestamp", () => {
    const timestamp = unix();
    assert.strictEqual(timestamp, 1577836812);
  });

  it("Should return true from isAfter if timestamp is after other", () => {
    const timestamp = isAfter(1577836813, 1577836812);
    assert.strictEqual(timestamp, true);
  });

  it("Should return false from isAfter if timestamp is before other", () => {
    const timestamp = isAfter(1577836811, 1577836812);
    assert.strictEqual(timestamp, false);
  });

  it("Should return true from isBefore if timestamp is before other", () => {
    const timestamp = isBefore(1577836811, 1577836812);
    assert.strictEqual(timestamp, true);
  });

  it("Should return false from isBefore if timestamp is after other", () => {
    const timestamp = isBefore(1577836813, 1577836812);
    assert.strictEqual(timestamp, false);
  });

  it("Should return true from isEqual if timestamp is equal", () => {
    const timestamp = isEqual(1577836812, 1577836812, 10);
    assert.strictEqual(timestamp, true);
  });

  it("Should return true from isEqual if timestamp is not equal but within tolerance", () => {
    const timestamp = isEqual(1577836815, 1577836812, 10);
    assert.strictEqual(timestamp, true);
  });

  it("Should return false from isEqual if timestamp is not equal", () => {
    const timestamp = isEqual(1577836825, 1577836812, 10);
    assert.strictEqual(timestamp, false);
  });
});
