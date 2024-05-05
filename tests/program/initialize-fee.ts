import { describe, it, beforeEach } from "mocha";
import assert from "assert";
import { testTransaction, startTestRunner, signerAddress, getFeeConfig, setFeeConfig } from "@/tests/program";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import { createInitializeFeeInstruction } from "@/core/instruction";

describe("initialize_fee", () => {
  const instruction = (props?: { feeAuthority?: PublicKey, feeWithdrawAuthority?: PublicKey, feeBps?: number }): TransactionInstruction => createInitializeFeeInstruction({
    payer: signerAddress,
    feeAuthority: props?.feeAuthority,
    feeWithdrawAuthority: props?.feeWithdrawAuthority,
    feeBps: props?.feeBps,
  });

  beforeEach(async () => {
    await startTestRunner();
  });

  it("Should be able to initialize fee config", async () => {
    await testTransaction([instruction()]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeBps, 100);
  });

  it("Should be able to initialize fee config with custom values", async () => {
    const authority = Keypair.generate().publicKey;
    await testTransaction([instruction({ feeAuthority: authority, feeWithdrawAuthority: authority, feeBps: 200 })]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeBps, 200);
  });

  it("Should be able to initialize an uninitialized fee config", async () => {
    await setFeeConfig({ initialized: false });
    await testTransaction([instruction()]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeBps, 100);
  });

  it("Should be able to update the fee config should if the authority", async () => {
    const authority = Keypair.generate().publicKey;
    await setFeeConfig({ feeAuthority: signerAddress });
    await testTransaction([instruction({ feeAuthority: authority, feeWithdrawAuthority: authority, feeBps: 200 })]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeBps, 200);
  });

  it("Should be able to update only the fee authority", async () => {
    const authority = Keypair.generate().publicKey;
    await setFeeConfig({ feeAuthority: signerAddress });
    await testTransaction([instruction({ feeAuthority: authority })]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeBps, 100);
  });

  it("Should be able to update only the fee withdraw authority", async () => {
    const authority = Keypair.generate().publicKey;
    await setFeeConfig({ feeAuthority: signerAddress });
    await testTransaction([instruction({ feeWithdrawAuthority: authority })]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), authority.toBase58());
    assert.strictEqual(feeConfig.feeBps, 100);
  });

  it("Should be able to update only the fee bps", async () => {
    await setFeeConfig({ feeAuthority: signerAddress });
    await testTransaction([instruction({ feeBps: 200 })]);
    const feeConfig = await getFeeConfig();
    assert.strictEqual(feeConfig.feeAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeWithdrawAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(feeConfig.feeBps, 200);
  });

  it("Should not be able to update without any changes", async () => {
    await setFeeConfig({});
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to update the fee config if not the authority", async () => {
    await setFeeConfig({ feeAuthority: Keypair.generate().publicKey });
    const promise = testTransaction([instruction({ feeAuthority: signerAddress })]);
    await assert.rejects(promise);
  });
});
