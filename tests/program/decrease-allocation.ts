import { describe, it, beforeEach } from "mocha";
import assert from "assert";
import { testTransaction, startTestRunner, signerAddress, setFeeConfig, getTokenAccount, setTokenMint, setTokenAccount, setAllocation, closeAccount, getAllocation } from "@/tests/program";
import { Keypair } from "@solana/web3.js";
import { createDecreaseAllocationInstruction } from "@/core/instruction";
import { allocationAddress, associatedTokenAddress, feeConfigAddress, solMint, tokenExtensionsProgramId, usdcMint, usdtMint } from "@/core/address";

describe("decrease_allocation", () => {
  const nftMintAddress = Keypair.generate().publicKey;
  const nftAllocationAddress = allocationAddress(nftMintAddress);
  const tokenMintAddress = Keypair.generate().publicKey;
  const signerTokenAddress = associatedTokenAddress(signerAddress, tokenMintAddress);
  const allocationTokenAddress = associatedTokenAddress(nftAllocationAddress, tokenMintAddress);
  const feeTokenAddress = associatedTokenAddress(feeConfigAddress, tokenMintAddress);
  const instruction = createDecreaseAllocationInstruction({
    payer: signerAddress,
    nftMint: nftMintAddress,
    tokenMint: tokenMintAddress,
    amount: 500000n,
  });

  beforeEach(async () => {
    await startTestRunner();
    await setFeeConfig({});
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: tokenMintAddress,
      firstTokenAmount: 1000000n,
    });
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      programId: tokenExtensionsProgramId,
    });
    await setTokenMint({
      address: tokenMintAddress,
      supply: 1000000n,
      decimals: 2,
    });
    await setTokenAccount({
      address: allocationTokenAddress,
      mint: tokenMintAddress,
      authority: nftAllocationAddress,
      amount: 1000000n,
    });
  });

  it("Should be able to decrease allocation", async () => {
    await testTransaction([instruction]);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 500000n);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 500000n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 500000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to decrease allocation with existing atas", async () => {
    await setTokenAccount({
      address: signerTokenAddress,
      mint: tokenMintAddress,
      authority: signerAddress,
    });
    await setTokenAccount({
      address: feeTokenAddress,
      mint: tokenMintAddress,
      authority: feeConfigAddress,
    });
    await testTransaction([instruction]);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 500000n);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 500000n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 500000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to decrease allocation with a token surplus", async () => {
    await setTokenAccount({
      address: allocationTokenAddress,
      mint: tokenMintAddress,
      authority: nftAllocationAddress,
      amount: 1500000n,
    });
    await testTransaction([instruction]);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 500000n);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 500000n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 500000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 500000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to decrease allocation with token is slot 2", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      secondTokenMint: tokenMintAddress,
      secondTokenAmount: 1000000n,
    });
    await testTransaction([instruction]);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 500000n);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 500000n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 500000n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to decrease allocation with token in slot 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      thirdTokenMint: tokenMintAddress,
      thirdTokenAmount: 1000000n,
    });
    await testTransaction([instruction]);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 500000n);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 500000n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 500000n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), tokenMintAddress.toBase58());
  });

  it("Should be able to decrease the full allocation", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: tokenMintAddress,
      firstTokenAmount: 500000n,
    });
    await setTokenAccount({
      address: allocationTokenAddress,
      mint: tokenMintAddress,
      authority: nftAllocationAddress,
      amount: 500000n,
    });
    await testTransaction([instruction]);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 500000n);
    const allocationToken = getTokenAccount(allocationTokenAddress);
    await assert.rejects(allocationToken);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to decrease a burned allocation", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      programId: tokenExtensionsProgramId,
    });
    await testTransaction([instruction]);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 500000n);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 500000n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 500000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should not be able to decrease allocation if not the decrease authority", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      firstTokenMint: tokenMintAddress,
      firstTokenAmount: 1000000n,
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to decrease a non-existing allocation", async () => {
    await closeAccount(nftAllocationAddress);
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to decrease allocation that is not initialized", async () => {
    await setAllocation({
      initialized: false,
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: tokenMintAddress,
      firstTokenAmount: 1000000n,
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to decrease more than the allocation contains", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: tokenMintAddress,
      firstTokenAmount: 100000n,
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to decrease allocation with an unrelated token", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: Keypair.generate().publicKey,
      firstTokenAmount: 1000000n,
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to decrease allocation with an uninitialized fee config", async () => {
    await setFeeConfig({ initialized: false });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });
});
