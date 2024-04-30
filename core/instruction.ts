import type { TransactionInstruction } from "@solana/web3.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import type { Jewl } from "@/target/types/jewl";
import idl from "@/target/idl/jewl.json";
import { allocationAddress, associatedTokenAddress, associatedTokenProgramId, feeConfigAddress, solMint, systemProgramId, tokenExtensionsProgramId, tokenProgramId } from "@/core/address";

const fauxWallet = {
  publicKey: PublicKey.default,
  signTransaction: async () => Promise.reject(new Error("No provider")),
  signAllTransactions: async () => Promise.reject(new Error("No provider")),
};

const fauxConnection = new Connection("https://api.devnet.solana.com");
const fauxProvider = new AnchorProvider(fauxConnection, fauxWallet, {});
const fauxProgram = new Program<Jewl>(idl as Jewl, fauxProvider);

export interface InitializeFeeInstructionProps {
  payer: PublicKey;
  feeBps?: number;
  feeAuthority?: PublicKey;
  feeWithdrawAuthority?: PublicKey;
}

export function createInitializeFeeInstruction(props: InitializeFeeInstructionProps): TransactionInstruction {
  const feeBps = props.feeBps ?? null;
  const feeAuthority = props.feeAuthority ?? null;
  const withdrawAuthority = props.feeWithdrawAuthority ?? null;
  return fauxProgram.instruction.initializeFee(feeBps, feeAuthority, withdrawAuthority, {
    accounts: {
      signer: props.payer,
      feeConfig: feeConfigAddress,
      systemProgram: systemProgramId,
    },
  });
}

export interface WithdrawFeeInstructionProps {
  payer: PublicKey;
  tokenMint: PublicKey;
  feeTokenAccount?: PublicKey;
  amount?: bigint;
}

export function createWithdrawFeeInstruction(props: WithdrawFeeInstructionProps): TransactionInstruction {
  const amount = props.amount != null ? new BN(props.amount.toString()) : null;
  return fauxProgram.instruction.withdrawFee(amount, {
    accounts: {
      signer: props.payer,
      feeConfig: feeConfigAddress,
      tokenMint: props.tokenMint,
      signerTokenAccount: associatedTokenAddress(props.payer, props.tokenMint),
      feeTokenAccount: props.feeTokenAccount ?? associatedTokenAddress(feeConfigAddress, props.tokenMint),
      systemProgram: systemProgramId,
      tokenProgram: tokenProgramId,
      associatedTokenProgram: associatedTokenProgramId,
    },
  });
}

export interface InitializeAllocationInstructionProps {
  payer: PublicKey;
  nftMint: PublicKey;
  authority?: PublicKey;
}

export function createInitializeAllocationInstruction(props: InitializeAllocationInstructionProps): TransactionInstruction {
  return fauxProgram.instruction.initializeAllocation(props.authority ?? null, {
    accounts: {
      signer: props.payer,
      feeConfig: feeConfigAddress,
      nftMint: props.nftMint,
      nftToken: associatedTokenAddress(props.payer, props.nftMint, tokenExtensionsProgramId),
      allocation: allocationAddress(props.nftMint),
      systemProgram: systemProgramId,
      tokenExtensionsProgram: tokenExtensionsProgramId,
      associatedTokenProgram: associatedTokenProgramId,
    },
  });
}

export interface IncreaseAllocationInstructionProps {
  payer: PublicKey;
  nftMint: PublicKey;
  tokenMint: PublicKey;
  amount: bigint;
}

export function createIncreaseAllocationInstruction(props: IncreaseAllocationInstructionProps): TransactionInstruction {
  const allocation = allocationAddress(props.nftMint);
  return fauxProgram.instruction.increaseAllocation(new BN(props.amount.toString()), {
    accounts: {
      signer: props.payer,
      feeConfig: feeConfigAddress,
      nftMint: props.nftMint,
      allocation,
      tokenMint: props.tokenMint,
      signerTokenAccount: associatedTokenAddress(props.payer, props.tokenMint),
      allocationTokenAccount: associatedTokenAddress(allocation, props.tokenMint),
      feeTokenAccount: associatedTokenAddress(feeConfigAddress, props.tokenMint),
      systemProgram: systemProgramId,
      tokenProgram: tokenProgramId,
      associatedTokenProgram: associatedTokenProgramId,
    },
  });
}

export interface DecreaseAllocationInstructionProps {
  payer: PublicKey;
  nftMint: PublicKey;
  tokenMint: PublicKey;
  amount: bigint;
}

export function createDecreaseAllocationInstruction(props: DecreaseAllocationInstructionProps): TransactionInstruction {
  const allocation = allocationAddress(props.nftMint);
  return fauxProgram.instruction.decreaseAllocation(new BN(props.amount.toString()), {
    accounts: {
      signer: props.payer,
      feeConfig: feeConfigAddress,
      nftMint: props.nftMint,
      allocation,
      tokenMint: props.tokenMint,
      signerTokenAccount: associatedTokenAddress(props.payer, props.tokenMint),
      allocationTokenAccount: associatedTokenAddress(allocation, props.tokenMint),
      feeTokenAccount: associatedTokenAddress(feeConfigAddress, props.tokenMint),
      systemProgram: systemProgramId,
      tokenProgram: tokenProgramId,
      associatedTokenProgram: associatedTokenProgramId,
    },
  });
}

export interface ExerciseAllocationInstructionProps {
  payer: PublicKey;
  nftMint: PublicKey;
  firstTokenMint?: PublicKey;
  secondTokenMint?: PublicKey;
  thirdTokenMint?: PublicKey;
}

export function createExerciseAllocationInstruction(props: ExerciseAllocationInstructionProps): TransactionInstruction {
  const allocation = allocationAddress(props.nftMint);
  return fauxProgram.instruction.exerciseAllocation({
    accounts: {
      signer: props.payer,
      feeConfig: feeConfigAddress,
      nftMint: props.nftMint,
      nftToken: associatedTokenAddress(props.payer, props.nftMint, tokenExtensionsProgramId),
      allocation: allocation,
      firstTokenMint: props.firstTokenMint ?? solMint,
      signerFirstTokenAccount: associatedTokenAddress(props.payer, props.firstTokenMint ?? solMint),
      allocationFirstTokenAccount: associatedTokenAddress(allocation, props.firstTokenMint ?? solMint),
      feeFirstTokenAccount: associatedTokenAddress(feeConfigAddress, props.firstTokenMint ?? solMint),
      secondTokenMint: props.secondTokenMint ?? solMint,
      signerSecondTokenAccount: associatedTokenAddress(props.payer, props.secondTokenMint ?? solMint),
      allocationSecondTokenAccount: associatedTokenAddress(allocation, props.secondTokenMint ?? solMint),
      feeSecondTokenAccount: associatedTokenAddress(feeConfigAddress, props.secondTokenMint ?? solMint),
      thirdTokenMint: props.thirdTokenMint ?? solMint,
      signerThirdTokenAccount: associatedTokenAddress(props.payer, props.thirdTokenMint ?? solMint),
      allocationThirdTokenAccount: associatedTokenAddress(allocation, props.thirdTokenMint ?? solMint),
      feeThirdTokenAccount: associatedTokenAddress(feeConfigAddress, props.thirdTokenMint ?? solMint),
      systemProgram: systemProgramId,
      tokenProgram: tokenProgramId,
      tokenExtensionsProgram: tokenExtensionsProgramId,
      associatedTokenProgram: associatedTokenProgramId,
    },
  });
}

