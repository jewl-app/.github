import { describe, it, beforeEach } from "mocha";
import assert from "assert";
import { testTransaction, startTestRunner, signerAddress, setFeeConfig, getTokenAccount, setTokenMint, setTokenAccount, setAllocation, closeAccount, getAllocation, getTokenMint } from "@/tests/program";
import type { TransactionInstruction } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createExerciseAllocationInstruction } from "@/core/instruction";
import { allocationAddress, associatedTokenAddress, feeConfigAddress, solMint, tokenExtensionsProgramId, usdcMint, usdtMint } from "@/core/address";

describe("exercise_allocation", () => {
  const nftMintAddress = Keypair.generate().publicKey;
  const nftTokenAddress = associatedTokenAddress(signerAddress, nftMintAddress, tokenExtensionsProgramId);
  const nftAllocationAddress = allocationAddress(nftMintAddress);
  const firstTokenMintAddress = Keypair.generate().publicKey;
  const firstSignerTokenAddress = associatedTokenAddress(signerAddress, firstTokenMintAddress);
  const firstAllocationTokenAddress = associatedTokenAddress(nftAllocationAddress, firstTokenMintAddress);
  const firstFeeTokenAddress = associatedTokenAddress(feeConfigAddress, firstTokenMintAddress);
  const secondTokenMintAddress = Keypair.generate().publicKey;
  const secondSignerTokenAddress = associatedTokenAddress(signerAddress, secondTokenMintAddress);
  const secondAllocationTokenAddress = associatedTokenAddress(nftAllocationAddress, secondTokenMintAddress);
  const secondFeeTokenAddress = associatedTokenAddress(feeConfigAddress, secondTokenMintAddress);
  const thirdTokenMintAddress = Keypair.generate().publicKey;
  const thirdSignerTokenAddress = associatedTokenAddress(signerAddress, thirdTokenMintAddress);
  const thirdAllocationTokenAddress = associatedTokenAddress(nftAllocationAddress, thirdTokenMintAddress);
  const thirdFeeTokenAddress = associatedTokenAddress(feeConfigAddress, thirdTokenMintAddress);
  const solSignerTokenAddress = associatedTokenAddress(signerAddress, solMint);
  const solAllocationTokenAddress = associatedTokenAddress(nftAllocationAddress, solMint);
  const solFeeTokenAddress = associatedTokenAddress(feeConfigAddress, solMint);
  const usdcSignerTokenAddress = associatedTokenAddress(signerAddress, usdcMint);
  const usdcAllocationTokenAddress = associatedTokenAddress(nftAllocationAddress, usdcMint);
  const usdcFeeTokenAddress = associatedTokenAddress(feeConfigAddress, usdcMint);
  const usdtSignerTokenAddress = associatedTokenAddress(signerAddress, usdtMint);
  const usdtAllocationTokenAddress = associatedTokenAddress(nftAllocationAddress, usdtMint);
  const usdtFeeTokenAddress = associatedTokenAddress(feeConfigAddress, usdtMint);
  const instruction = (props?: { noFirst?: boolean, noSecond?: boolean, noThird?: boolean }): TransactionInstruction => createExerciseAllocationInstruction({
    payer: signerAddress,
    nftMint: nftMintAddress,
    firstTokenMint: props?.noFirst ?? false ? solMint : firstTokenMintAddress,
    secondTokenMint: props?.noSecond ?? false ? usdcMint : secondTokenMintAddress,
    thirdTokenMint: props?.noThird ?? false ? usdtMint : thirdTokenMintAddress,
  });

  beforeEach(async () => {
    await startTestRunner();
    await setFeeConfig({});
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: firstTokenMintAddress,
      firstTokenAmount: 1000000n,
      secondTokenMint: secondTokenMintAddress,
      secondTokenAmount: 1000000n,
      thirdTokenMint: thirdTokenMintAddress,
      thirdTokenAmount: 1000000n,
    });
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setTokenAccount({
      address: nftTokenAddress,
      mint: nftMintAddress,
      authority: signerAddress,
      amount: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setTokenMint({
      address: usdcMint,
      supply: 0n,
    });
    await setTokenMint({
      address: usdtMint,
      supply: 0n,
    });
    await setTokenMint({
      address: firstTokenMintAddress,
      supply: 1000000n,
      decimals: 2,
    });
    await setTokenAccount({
      address: firstAllocationTokenAddress,
      mint: firstTokenMintAddress,
      authority: nftAllocationAddress,
      amount: 1000000n,
    });
    await setTokenMint({
      address: secondTokenMintAddress,
      supply: 1000000n,
      decimals: 2,
    });
    await setTokenAccount({
      address: secondAllocationTokenAddress,
      mint: secondTokenMintAddress,
      authority: nftAllocationAddress,
      amount: 1000000n,
    });
    await setTokenMint({
      address: thirdTokenMintAddress,
      supply: 1000000n,
      decimals: 2,
    });
    await setTokenAccount({
      address: thirdAllocationTokenAddress,
      mint: thirdTokenMintAddress,
      authority: nftAllocationAddress,
      amount: 1000000n,
    });
  });

  it("Should be able to exercise an allocation", async () => {
    await testTransaction([instruction()]);
    const firstSignerToken = await getTokenAccount(firstSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 1000000n);
    const secondSignerToken = await getTokenAccount(secondSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 1000000n);
    const thirdSignerToken = await getTokenAccount(thirdSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 1000000n);
    const firstAllocationToken = getTokenAccount(firstAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(secondAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(thirdAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(firstFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(secondFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(thirdFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an allocation with existing atas", async () => {
    await setTokenAccount({
      address: firstSignerTokenAddress,
      mint: firstTokenMintAddress,
      authority: signerAddress,
    });
    await setTokenAccount({
      address: secondSignerTokenAddress,
      mint: secondTokenMintAddress,
      authority: signerAddress,
    });
    await setTokenAccount({
      address: thirdSignerTokenAddress,
      mint: thirdTokenMintAddress,
      authority: signerAddress,
    });
    await setTokenAccount({
      address: firstFeeTokenAddress,
      mint: firstTokenMintAddress,
      authority: feeConfigAddress,
    });
    await setTokenAccount({
      address: secondFeeTokenAddress,
      mint: secondTokenMintAddress,
      authority: feeConfigAddress,
    });
    await setTokenAccount({
      address: thirdFeeTokenAddress,
      mint: thirdTokenMintAddress,
      authority: feeConfigAddress,
    });
    await testTransaction([instruction()]);
    const firstSignerToken = await getTokenAccount(firstSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 1000000n);
    const secondSignerToken = await getTokenAccount(secondSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 1000000n);
    const thirdSignerToken = await getTokenAccount(thirdSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 1000000n);
    const firstAllocationToken = getTokenAccount(firstAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(secondAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(thirdAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(firstFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(secondFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(thirdFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an empty allocation", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
    });
    await testTransaction([instruction({ noFirst: true, noSecond: true, noThird: true })]);
    const firstSignerToken = await getTokenAccount(solSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 0n);
    const secondSignerToken = await getTokenAccount(usdcSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 0n);
    const thirdSignerToken = await getTokenAccount(usdtSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 0n);
    const firstAllocationToken = getTokenAccount(solAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(usdcAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(usdtAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(solFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(usdcFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(usdtFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an allocation with token in slot 1", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: firstTokenMintAddress,
      firstTokenAmount: 1000000n,
    });
    await testTransaction([instruction({ noSecond: true, noThird: true })]);
    const firstSignerToken = await getTokenAccount(firstSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 1000000n);
    const secondSignerToken = await getTokenAccount(usdcSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 0n);
    const thirdSignerToken = await getTokenAccount(usdtSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 0n);
    const firstAllocationToken = getTokenAccount(firstAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(usdcAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(usdtAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(firstFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(usdcFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(usdtFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an allocation with token in slot 2", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      secondTokenMint: secondTokenMintAddress,
      secondTokenAmount: 1000000n,
    });
    await testTransaction([instruction({ noFirst: true, noThird: true })]);
    const firstSignerToken = await getTokenAccount(solSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 0n);
    const secondSignerToken = await getTokenAccount(secondSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 1000000n);
    const thirdSignerToken = await getTokenAccount(usdtSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 0n);
    const firstAllocationToken = getTokenAccount(solAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(secondAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(usdtAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(solFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(secondFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(usdtFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an allocation with token in slot 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      thirdTokenMint: thirdTokenMintAddress,
      thirdTokenAmount: 1000000n,
    });
    await testTransaction([instruction({ noFirst: true, noSecond: true })]);
    const firstSignerToken = await getTokenAccount(solSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 0n);
    const secondSignerToken = await getTokenAccount(usdcSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 0n);
    const thirdSignerToken = await getTokenAccount(thirdSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 1000000n);
    const firstAllocationToken = getTokenAccount(solAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(usdcAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(thirdAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(solFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(usdcFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(thirdFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an allocation with token in slot 1 and 2", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: firstTokenMintAddress,
      firstTokenAmount: 1000000n,
      secondTokenMint: secondTokenMintAddress,
      secondTokenAmount: 1000000n,
    });
    await testTransaction([instruction({ noThird: true })]);
    const firstSignerToken = await getTokenAccount(firstSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 1000000n);
    const secondSignerToken = await getTokenAccount(secondSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 1000000n);
    const thirdSignerToken = await getTokenAccount(usdtSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 0n);
    const firstAllocationToken = getTokenAccount(firstAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(secondAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(usdtAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(firstFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(secondFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(usdtFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an allocation with token in slot 1 and 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: firstTokenMintAddress,
      firstTokenAmount: 1000000n,
      thirdTokenMint: thirdTokenMintAddress,
      thirdTokenAmount: 1000000n,
    });
    await testTransaction([instruction({ noSecond: true })]);
    const firstSignerToken = await getTokenAccount(firstSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 1000000n);
    const secondSignerToken = await getTokenAccount(usdcSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 0n);
    const thirdSignerToken = await getTokenAccount(thirdSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 1000000n);
    const firstAllocationToken = getTokenAccount(firstAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(usdcAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(thirdAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(firstFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(usdcFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(thirdFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an allocation with token in slot 2 and 3", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      secondTokenMint: secondTokenMintAddress,
      secondTokenAmount: 1000000n,
      thirdTokenMint: thirdTokenMintAddress,
      thirdTokenAmount: 1000000n,
    });
    await testTransaction([instruction({ noFirst: true })]);
    const firstSignerToken = await getTokenAccount(solSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 0n);
    const secondSignerToken = await getTokenAccount(secondSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 1000000n);
    const thirdSignerToken = await getTokenAccount(thirdSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 1000000n);
    const firstAllocationToken = getTokenAccount(solAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(secondAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(thirdAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(solFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 0n);
    const secondFeeToken = await getTokenAccount(secondFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 0n);
    const thirdFeeToken = await getTokenAccount(thirdFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 0n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should be able to exercise an allocation with token surplus", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: firstTokenMintAddress,
      firstTokenAmount: 500000n,
      secondTokenMint: secondTokenMintAddress,
      secondTokenAmount: 500000n,
      thirdTokenMint: thirdTokenMintAddress,
      thirdTokenAmount: 500000n,
    });
    await testTransaction([instruction()]);
    const firstSignerToken = await getTokenAccount(firstSignerTokenAddress);
    assert.strictEqual(firstSignerToken.amount, 500000n);
    const secondSignerToken = await getTokenAccount(secondSignerTokenAddress);
    assert.strictEqual(secondSignerToken.amount, 500000n);
    const thirdSignerToken = await getTokenAccount(thirdSignerTokenAddress);
    assert.strictEqual(thirdSignerToken.amount, 500000n);
    const firstAllocationToken = getTokenAccount(firstAllocationTokenAddress);
    await assert.rejects(firstAllocationToken);
    const secondAllocationToken = getTokenAccount(secondAllocationTokenAddress);
    await assert.rejects(secondAllocationToken);
    const thirdAllocationToken = getTokenAccount(thirdAllocationTokenAddress);
    await assert.rejects(thirdAllocationToken);
    const firstFeeToken = await getTokenAccount(firstFeeTokenAddress);
    assert.strictEqual(firstFeeToken.amount, 500000n);
    const secondFeeToken = await getTokenAccount(secondFeeTokenAddress);
    assert.strictEqual(secondFeeToken.amount, 500000n);
    const thirdFeeToken = await getTokenAccount(thirdFeeTokenAddress);
    assert.strictEqual(thirdFeeToken.amount, 500000n);
    const nftToken = getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    await assert.rejects(nftToken);
    const nftMint = getTokenMint(nftMintAddress, tokenExtensionsProgramId);
    await assert.rejects(nftMint);
    const allocation = getAllocation(nftAllocationAddress);
    await assert.rejects(allocation);
  });

  it("Should not be able to exercise allocation if not the owner", async () => {
    await closeAccount(nftTokenAddress);
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise allocation if not the owner but with a token account", async () => {
    await setTokenAccount({
      address: nftTokenAddress,
      mint: nftMintAddress,
      authority: signerAddress,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise a burned allocation", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      programId: tokenExtensionsProgramId,
    });
    await closeAccount(nftTokenAddress);
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise a burned allocation but with a token account", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      programId: tokenExtensionsProgramId,
    });
    await setTokenAccount({
      address: nftTokenAddress,
      mint: nftMintAddress,
      authority: signerAddress,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise an allocation with wrong token in slot 1", async () => {
    await setTokenAccount({
      address: solAllocationTokenAddress,
      mint: solMint,
      authority: nftAllocationAddress,
      amount: 1000000n,
    });
    const promise = testTransaction([instruction({ noFirst: true })]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise an allocation with wrong token in slot 2", async () => {
    await setTokenAccount({
      address: solAllocationTokenAddress,
      mint: solMint,
      authority: nftAllocationAddress,
      amount: 1000000n,
    });
    const promise = testTransaction([instruction({ noSecond: true })]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise an allocation with wrong token in slot 3", async () => {
    await setTokenAccount({
      address: solAllocationTokenAddress,
      mint: solMint,
      authority: nftAllocationAddress,
      amount: 1000000n,
    });
    const promise = testTransaction([instruction({ noThird: true })]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise an uninitialized allocation", async () => {
    await setAllocation({
      initialized: false,
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
      firstTokenMint: firstTokenMintAddress,
      firstTokenAmount: 500000n,
      secondTokenMint: firstTokenMintAddress,
      secondTokenAmount: 500000n,
      thirdTokenMint: thirdTokenMintAddress,
      thirdTokenAmount: 500000n,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise with an uninitialized fee config", async () => {
    await setFeeConfig({ initialized: false });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise an allocation with the wrong mint authority", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: PublicKey.default,
      mintCloseAuthority: feeConfigAddress,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to exercise an allocation with the wrong mint close authority", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: PublicKey.default,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });
});
