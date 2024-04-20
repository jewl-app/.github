import { describe, it, beforeEach } from "mocha";
import assert from "assert";
import { testTransaction, startTestRunner } from "@/tests/program";
import { Transaction, TransactionInstruction } from "@solana/web3.js";
import { jewlProgramId } from "@/core/address";
import { createHash } from "crypto";

describe("misc", () => {

  beforeEach(async () => {
    await startTestRunner();
  });

  it("Calling a unkown instruction should fail", async () => {
    const identifier = createHash("sha256").update("ThisMethodDoesNotExist")
      .digest();
    const instruction = new TransactionInstruction({
      keys: [],
      programId: jewlProgramId,
      data: identifier.subarray(0, 8),
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise, "Transaction should fail");
  });
});
