import { describe, it, beforeEach, afterEach } from "mocha";
import assert from "assert";
import type { SinonFakeTimers, SinonStub } from "sinon";
import { stub, useFakeTimers } from "sinon";
import { invalidateCache } from "@/core/cache";
import { cachedFetch } from "@/core/cache";

describe("cache", () => {
  let clock = { } as SinonFakeTimers;
  let fetchStub = { } as SinonStub;

  const res = async (body: string): Promise<Response> => Promise.resolve(new Response(JSON.stringify(body)));

  beforeEach(async () => {
    clock = useFakeTimers();
    fetchStub = stub(global, "fetch");
    fetchStub.onCall(0).returns(res("1"));
    fetchStub.onCall(1).returns(res("2"));
    await cachedFetch("https://example.com");
  });

  afterEach(() => {
    invalidateCache();
    clock.restore();
    fetchStub.restore();
  });

  it("Should return cached response", async () => {
    const actual = await cachedFetch("https://example.com", 30) as string;
    assert.strictEqual(actual, "1");
  });

  it("Should return new response after ttl", async () => {
    clock.tick(31 * 1000);
    const actual = await cachedFetch("https://example.com", 30) as string;
    assert.strictEqual(actual, "2");
  });

  it("Should return old response after longer ttl", async () => {
    clock.tick(31 * 1000);
    const actual = await cachedFetch("https://example.com", 60) as string;
    assert.strictEqual(actual, "1");
  });

  it("Should return new response with different url", async () => {
    const actual = await cachedFetch("https://example.com/2", 30) as string;
    assert.strictEqual(actual, "2");
  });

});
