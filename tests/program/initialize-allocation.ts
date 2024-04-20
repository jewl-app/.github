import { describe, it, beforeEach } from "mocha";
import assert from "assert";
import { testTransaction, startTestRunner, signerAddress, setFeeConfig, getTokenAccount, setTokenMint, setTokenAccount, setAllocation, getAllocation } from "@/tests/program";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createInitializeAllocationInstruction } from "@/core/instruction";
import { allocationAddress, associatedTokenAddress, feeConfigAddress, solMint, tokenExtensionsProgramId, usdcMint, usdtMint } from "@/core/address";

describe("initialize_allocation", () => {
  const nftMintAddress = Keypair.generate().publicKey;
  const nftAllocationAddress = allocationAddress(nftMintAddress);
  const nftTokenAddress = associatedTokenAddress(signerAddress, nftMintAddress, tokenExtensionsProgramId);
  const instruction = (props?: { authority?: PublicKey }) => createInitializeAllocationInstruction({
    payer: signerAddress,
    nftMint: nftMintAddress,
    authority: props?.authority,
  });

  beforeEach(async () => {
    await startTestRunner();
    await setFeeConfig({});
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      programId: tokenExtensionsProgramId,
    });
  });

  it("Should be able to initialize allocation", async () => {
    await testTransaction([instruction()]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 1n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able initialize allocation with existing ata", async () => {
    await setTokenAccount({
      address: nftTokenAddress,
      mint: nftMintAddress,
      authority: signerAddress,
      programId: tokenExtensionsProgramId,
    });
    await testTransaction([instruction()]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 1n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to initialize an uninitialized allocation", async () => {
    await setAllocation({
      initialized: false,
      nftMint: nftMintAddress,
    });
    await testTransaction([instruction()]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 1n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to initialize an allocation with a decrease authority", async () => {
    const decreaseAuthority = Keypair.generate().publicKey;
    await testTransaction([instruction({ authority: decreaseAuthority })]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 1n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), decreaseAuthority.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to initialize a burned allocation if the recover authority", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
      recoverAuthority: signerAddress,
      firstTokenAmount: 100000n,
      firstTokenMint: usdcMint,
      secondTokenAmount: 100000n,
      secondTokenMint: usdtMint,
      thirdTokenAmount: 100000n,
      thirdTokenMint: solMint,
    });
    await testTransaction([instruction({ authority: signerAddress })]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 1n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), signerAddress.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 100000n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 100000n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdtMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 100000n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), solMint.toBase58());
  });

  it("Should be able to update the recover authority", async () => {
    const recoverAuthority = Keypair.generate().publicKey;
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setAllocation({
      nftMint: nftMintAddress,
      recoverAuthority: signerAddress,
    });
    await testTransaction([instruction({ authority: recoverAuthority })]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), recoverAuthority.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to renounce the recover authority", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setAllocation({
      nftMint: nftMintAddress,
      recoverAuthority: signerAddress,
    });
    await testTransaction([instruction()]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to update the decrease authority", async () => {
    const decreaseAuthority = Keypair.generate().publicKey;
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
    });
    await testTransaction([instruction({ authority: decreaseAuthority })]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), decreaseAuthority.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should be able to renounce the recover authority", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
    });
    await testTransaction([instruction()]);
    const nftToken = await getTokenAccount(nftTokenAddress, tokenExtensionsProgramId);
    assert.strictEqual(nftToken.amount, 0n);
    const allocation = await getAllocation(nftAllocationAddress);
    assert.strictEqual(allocation.initialized, true);
    assert.strictEqual(allocation.decreaseAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.recoverAuthority.toBase58(), PublicKey.default.toBase58());
    assert.strictEqual(allocation.firstTokenAmount, 0n);
    assert.strictEqual(allocation.firstTokenMint.toBase58(), solMint.toBase58());
    assert.strictEqual(allocation.secondTokenAmount, 0n);
    assert.strictEqual(allocation.secondTokenMint.toBase58(), usdcMint.toBase58());
    assert.strictEqual(allocation.thirdTokenAmount, 0n);
    assert.strictEqual(allocation.thirdTokenMint.toBase58(), usdtMint.toBase58());
  });

  it("Should not be able to initialize a burned allocation if not the recover authority", async () => {
    await setAllocation({
      nftMint: nftMintAddress,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to initialize an existing allocation", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to set the recover authority to the decrease authority", async () => {
    const decreaseAuthority = Keypair.generate().publicKey;
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
    });
    await setAllocation({
      nftMint: nftMintAddress,
      recoverAuthority: signerAddress,
      decreaseAuthority: decreaseAuthority,
    });
    const promise = testTransaction([instruction({ authority: decreaseAuthority })]);
    await assert.rejects(promise);
  });

  it("Should not be able to set the decrease authority to the recover authority", async () => {
    const recoverAuthority = Keypair.generate().publicKey;
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      supply: 1n,
      programId: tokenExtensionsProgramId,
    });
    await setAllocation({
      nftMint: nftMintAddress,
      decreaseAuthority: signerAddress,
    });
    await setAllocation({
      nftMint: nftMintAddress,
      recoverAuthority: recoverAuthority,
      decreaseAuthority: signerAddress,
    });
    const promise = testTransaction([instruction({ authority: recoverAuthority })]);
    await assert.rejects(promise);
  });

  it("Should not be able to initialize an allocation with a non-nft mint", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: feeConfigAddress,
      decimals: 2,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to initialize an allocation with a non-extensions mint", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to initialize an allocation with the incorrect mint authority", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: PublicKey.default,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to initialize an allocation with the incorrect mint close authority", async () => {
    await setTokenMint({
      address: nftMintAddress,
      authority: feeConfigAddress,
      mintCloseAuthority: PublicKey.default,
      programId: tokenExtensionsProgramId,
    });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });

  it("Should not be able to initialize an allocation with an uninitialized fee config", async () => {
    await setFeeConfig({ initialized: false });
    const promise = testTransaction([instruction()]);
    await assert.rejects(promise);
  });
});
