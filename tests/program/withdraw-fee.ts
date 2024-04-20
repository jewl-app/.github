import { describe, it, beforeEach } from "mocha";
import assert from "assert";
import { testTransaction, startTestRunner, signerAddress, setTokenMint, setTokenAccount, getTokenAccount, getAccount, setFeeConfig } from "@/tests/program";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createWithdrawFeeInstruction } from "@/core/instruction";
import { associatedTokenAddress, feeConfigAddress } from "@/core/address";

describe("withdraw_fee", () => {
  const tokenMintAddress = Keypair.generate().publicKey;
  const feeTokenAddress = associatedTokenAddress(feeConfigAddress, tokenMintAddress);
  const signerTokenAddress = associatedTokenAddress(signerAddress, tokenMintAddress);
  const instruction = createWithdrawFeeInstruction({
    payer: signerAddress,
    tokenMint: tokenMintAddress,
  });

  beforeEach(async () => {
    await startTestRunner();
    await setFeeConfig({});
    await setTokenMint({
      address: tokenMintAddress,
      supply: 1000000n,
      decimals: 2,
    });
    await setTokenAccount({
      address: feeTokenAddress,
      mint: tokenMintAddress,
      authority: feeConfigAddress,
      amount: 1000000n,
    });
  });

  it("Should be able to withdraw protocol fees", async () => {
    await testTransaction([instruction]);
    const feeToken = getTokenAccount(feeTokenAddress);
    await assert.rejects(feeToken);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 1000000n);
  });

  it("Should be able to withdraw protocol fees from a non-ata", async () => {
    const nonAta = Keypair.generate().publicKey;
    await setTokenAccount({
      address: nonAta,
      mint: tokenMintAddress,
      authority: feeConfigAddress,
      amount: 1000000n,
    });
    const nonAtaInstruction = createWithdrawFeeInstruction({
      payer: signerAddress,
      tokenMint: tokenMintAddress,
      feeTokenAccount: nonAta,
    });
    await testTransaction([nonAtaInstruction]);
    const feeToken = getTokenAccount(nonAta);
    await assert.rejects(feeToken);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 1000000n);
  });

  it("Should be to withdraw protocol fees if ata already exists", async () => {
    await setTokenAccount({
      address: signerTokenAddress,
      mint: tokenMintAddress,
      authority: signerAddress,
    });
    await testTransaction([instruction]);
    const feeToken = getTokenAccount(feeTokenAddress);
    await assert.rejects(feeToken);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 1000000n);
  });

  it("Should not be able to withdraw if not the withdraw authority", async () => {
    await setFeeConfig({
      feeWithdrawAuthority: PublicKey.default,
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to withdraw with an uninitialized fee config", async () => {
    await setFeeConfig({ initialized: false });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

});
