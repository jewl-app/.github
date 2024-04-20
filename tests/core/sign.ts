import { Keypair } from "@solana/web3.js";
import { getSignature, validateSignature } from "@/core/sign";
import type { Signature } from "@/core/sign";
import { describe, it, beforeEach, afterEach } from "mocha";
import assert from "assert";
import type { SinonFakeTimers, SinonStub } from "sinon";
import { useFakeTimers, stub } from "sinon";
import crypto from "crypto";

const validTimestamp = 1577836800000;
const invalidTimestamp = 1577923200000;

const mockSecretKey = new Uint8Array([
  37, 82, 2, 69, 62, 136, 24, 68, 66, 70, 53,
  200, 22, 109, 170, 138, 165, 97, 150, 216, 137, 3,
  191, 124, 204, 155, 0, 158, 69, 180, 45, 226, 164,
  160, 152, 169, 147, 219, 167, 128, 189, 236, 54, 61,
  16, 127, 119, 142, 161, 224, 197, 65, 73, 231, 213,
  155, 56, 135, 92, 99, 121, 147, 209, 77,
]);
const mockSigner = Keypair.fromSecretKey(mockSecretKey);
const mockAuthKey = "6EnyEToRWujssHafJnKrDw8AXNune4ReeXvgXuYNaiUdAbgZE3dLwYcBiE4WeibCgcG5CYDgtyzu5Qb6xzrDjeiwso6gw9hHC62acE6g4YKMqpEWRDfRKh6FFkK32oWtMDK3zeCuphMxkHzcF5ZFxw2t:3QYcVLqSSejJNYEdGPaxjdrrQ3sPnHQSos5MiaGsdynRbNzqVJLxnNPRxzbLFnUzYeTnv3YPrt5y18AihfPA9kuj";
const expectedAuth: Signature = { signer: mockSigner.publicKey, scope: "test" };

describe("sign", () => {
  let clock = { } as SinonFakeTimers;
  let uuidMock = { } as SinonStub;

  beforeEach(() => {
    clock = useFakeTimers();
    uuidMock = stub(crypto, "randomUUID").returns("1-1-1-1-1");
  });

  afterEach(() => {
    clock.restore();
    uuidMock.restore();
  });

  it("Get signature should produce a valid auth key", async () => {
    clock.now = validTimestamp;
    const auth = await getSignature(mockSigner, "test");
    assert.strictEqual(auth, mockAuthKey);
  });

  it("Valid signature should verify", () => {
    clock.now = validTimestamp;
    const auth = validateSignature(mockAuthKey);
    assert.deepStrictEqual(auth, expectedAuth);
  });

  it("Invalid signature should not verify", () => {
    clock.now = validTimestamp;
    const fakeKey = `${mockAuthKey.slice(0, -1)}1`;
    const auth = validateSignature(fakeKey);
    assert.strictEqual(auth, null);
  });

  it("Expired signature should not verify", () => {
    clock.now = invalidTimestamp;
    const auth = validateSignature(mockAuthKey);
    assert.strictEqual(auth, null);
  });

  it("Signature should verify with custom expiry", () => {
    clock.now = invalidTimestamp;
    const auth = validateSignature(mockAuthKey, 172800);
    assert.deepStrictEqual(auth, expectedAuth);
  });
});

