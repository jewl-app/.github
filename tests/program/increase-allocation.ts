import { describe, it, beforeEach } from "mocha";
import assert from "assert";
import { testTransaction, startTestRunner, signerAddress, setFeeConfig, getTokenAccount, setTokenMint, setTokenAccount, setAllocation, closeAccount, getAllocation } from "@/tests/program";
import { Keypair } from "@solana/web3.js";
import { createIncreaseAllocationInstruction } from "@/core/instruction";
import { allocationAddress, associatedTokenAddress, feeConfigAddress, solMint, tokenExtensionsProgramId, usdcMint, usdtMint } from "@/core/address";

describe("increase_allocation", () => {
  const nftMintAddress = Keypair.generate().publicKey;
  const nftAllocationAddress = allocationAddress(nftMintAddress);
  const tokenMintAddress = Keypair.generate().publicKey;
  const signerTokenAddress = associatedTokenAddress(signerAddress, tokenMintAddress);
  const allocationTokenAddress = associatedTokenAddress(nftAllocationAddress, tokenMintAddress);
  const feeTokenAddress = associatedTokenAddress(feeConfigAddress, tokenMintAddress);
  const instruction = createIncreaseAllocationInstruction({
    payer: signerAddress,
    nftMint: nftMintAddress,
    tokenMint: tokenMintAddress,
    amount: 1000000n,
  });

  beforeEach(async () => {
    await startTestRunner();
    await setFeeConfig({
      feeBps: 100,
    });
    await setAllocation({ nftMint: nftMintAddress });
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setTokenMint({
      address: tokenMintAddress,
      supply: 1000000n,
      decimals: 2,
    });
    await setTokenAccount({
      address: signerTokenAddress,
      mint: tokenMintAddress,
      authority: signerAddress,
      amount: 1000000n,
    });
  });

  it("Should be able to increase an allocation", async () => {
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 990000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to increase an allocation with existing atas", async () => {
    await setTokenAccount({
      address: feeTokenAddress,
      mint: tokenMintAddress,
      authority: feeConfigAddress,
    });
    await setTokenAccount({
      address: allocationTokenAddress,
      mint: tokenMintAddress,
      authority: nftAllocationAddress,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 990000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be be able to increase an allocation with a token in slot 1", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      firstTokenAmount: 1000000n,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 1000000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 990000n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be be able to increase an allocation with a token in slot 2", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      secondTokenAmount: 1000000n,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 990000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 1000000n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be be able to increase an allocation with a token in slot 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      thirdTokenAmount: 1000000n,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 990000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 1000000n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be be able to increase an allocation with a token in slot 1 and 2", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      firstTokenAmount: 1000000n,
      secondTokenAmount: 1000000n,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 1000000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 1000000n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 990000n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), tokenMintAddress.toBase58());
  });

  it("Should be be able to increase an allocation with a token in slot 1 and 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      firstTokenAmount: 1000000n,
      thirdTokenAmount: 1000000n,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 1000000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 990000n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 1000000n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be be able to increase an allocation with a token in slot 2 and 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      secondTokenAmount: 1000000n,
      thirdTokenAmount: 1000000n,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 990000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 1000000n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 1000000n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should not be able to increase an allocation with a token in slot 1, 2 and 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      firstTokenAmount: 1000000n,
      secondTokenAmount: 1000000n,
      thirdTokenAmount: 1000000n,
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should be able to increase an allocation if the token is already in slot 1", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      firstTokenMint: tokenMintAddress,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 990000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to increase an allocation if the token is already in slot 2", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      secondTokenMint: tokenMintAddress,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 990000n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to increase an allocation if the token is already in slot 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      thirdTokenMint: tokenMintAddress,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 10000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 990000n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), tokenMintAddress.toBase58());
  });

  it("Should be able to increase an allocation if there is a token surplus in the allocation", async () => {
    await setTokenAccount({
      address: allocationTokenAddress,
      mint: tokenMintAddress,
      authority: nftAllocationAddress,
      amount: 1000000n,
    });
    await testTransaction([instruction]);
    const allocationToken = await getTokenAccount(allocationTokenAddress);
    assert.strictEqual(allocationToken.amount, 990000n);
    const signerToken = await getTokenAccount(signerTokenAddress);
    assert.strictEqual(signerToken.amount, 0n);
    const feeToken = await getTokenAccount(feeTokenAddress);
    assert.strictEqual(feeToken.amount, 1010000n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.firstTokenAmount, 990000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), tokenMintAddress.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should not be able to increase a non-existing allocation", async () => {
    await closeAccount(nftAllocationAddress);
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to increase a burned allocation", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to increase allocation that is not initialized", async () => {
    await setAllocation({
      initialized: false,
      nftMint: nftMintAddress,
    });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });

  it("Should not be able to increase allocation with an uninitialized fee config", async () => {
    await setFeeConfig({ initialized: false });
    const promise = testTransaction([instruction]);
    await assert.rejects(promise);
  });
});
