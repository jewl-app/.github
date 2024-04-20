import { describe, it, beforeEach } from "mocha";
import assert from "assert";
import { testTransaction, startTestRunner, signerAddress, getFeeConfig, setFeeConfig } from "@/tests/program";
import { Keypair } from "@solana/web3.js";
import { createInitializeFeeInstruction } from "@/core/instruction";

describe("initialize_fee", () => {
  const authority = Keypair.generate().publicKey;
  const instruction = createInitializeFeeInstruction({
    payer: signerAddress,
    feeBps: 100,
    withdrawAuthority: authority,
  });

  beforeEach(async () => {
    await startTestRunner();
  });

  it("Should be able to initialize fee config", async () => {
    await testTransaction([instruction]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeBps, 100);
  });

  it("Should be able to initialize an uninitialized fee config", async () => {
    await setFeeConfig({ initialized: false });
    await testTransaction([instruction]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeBps, 100);
  });

  it("Should be able to update the fee config should if the authority", async () => {
    await setFeeConfig({ feeAuthority: signerAddress });
    await testTransaction([instruction]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeBps, 100);
  });

  it("Should not be able to update the fee config if not the authority", async () => {
    await setFeeConfig({ feeAuthority: authority });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });
});
