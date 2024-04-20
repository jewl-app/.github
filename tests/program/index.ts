import { allocationAddress, feeConfigAddress, jewlProgramId, solMint, systemProgramId, tokenExtensionsProgramId, tokenProgramId, usdcMint, usdtMint } from "@/core/address";
import type { BanksTransactionMeta, ProgramTestContext } from "solana-bankrun";
import { Clock, startAnchor } from "solana-bankrun";
import { AccountInfo, Keypair, Signer, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { Account, Mint } from "@solana/spl-token";
import { ACCOUNT_SIZE, AccountLayout, AccountState, MINT_SIZE, MintLayout, unpackAccount, unpackMint } from "@solana/spl-token";
import { AllocationAccount, FeeConfigAccount, packAllocation, packFeeConfig, unpackAllocation, unpackFeeConfig } from "@/core/coder";

let context: ProgramTestContext = { } as ProgramTestContext;
const testSigner = Keypair.generate();
export const signerAddress = testSigner.publicKey;

export async function closeAccount(address: PublicKey): Promise<void> {
  context.setAccount(address, {
    executable: false,
    owner: systemProgramId,
    lamports: 0,
    data: Buffer.alloc(0),
  });
}

export interface TokenMintProps {
  address: PublicKey;
  authority?: PublicKey;
  supply?: bigint;
  decimals?: number;
  programId?: PublicKey;
  mintCloseAuthority?: PublicKey;
}

const mintTlvData = Buffer.from([
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]);

export async function setTokenMint(props: TokenMintProps): Promise<void> {
  const tokenProgram = props.programId ?? tokenProgramId;
  const hasTlvData = props.mintCloseAuthority != null && props.programId === tokenExtensionsProgramId;
  const tlvData = hasTlvData ? mintTlvData : Buffer.alloc(0);
  const buffer = Buffer.alloc(MINT_SIZE + tlvData.length);
  MintLayout.encode({
    mintAuthorityOption: props.authority ? 1 : 0,
    mintAuthority: props.authority ?? PublicKey.default,
    supply: props.supply ?? 0n,
    decimals: props.decimals ?? 0,
    isInitialized: true,
    freezeAuthorityOption: 0,
    freezeAuthority: PublicKey.default,
  }, buffer);

  if (hasTlvData) {
    const mintCloseAuthority = props.mintCloseAuthority ?? PublicKey.default;
    const closeData = mintCloseAuthority.toBuffer();
    const offset = MINT_SIZE + tlvData.length - closeData.length;
    tlvData.copy(buffer, MINT_SIZE, 0, tlvData.length);
    closeData.copy(buffer, offset, 0, closeData.length);
  }

  context.setAccount(props.address, {
    executable: false,
    owner: tokenProgram,
    lamports: LAMPORTS_PER_SOL,
    data: buffer,
  });
}

interface TokenAccountProps {
  address: PublicKey;
  mint: PublicKey;
  authority: PublicKey;
  amount?: bigint;
  programId?: PublicKey;
}

export async function setTokenAccount(props: TokenAccountProps): Promise<void> {
  const tokenProgram = props.programId ?? tokenProgramId;
  const buffer = Buffer.alloc(ACCOUNT_SIZE);
  AccountLayout.encode({
    mint: props.mint,
    owner: props.authority,
    amount: props.amount ?? 0n,
    delegate: PublicKey.default,
    delegatedAmount: 0n,
    delegateOption: 0,
    isNative: BigInt(props.mint.equals(solMint) ? 1 : 0),
    isNativeOption: props.mint.equals(solMint) ? 1 : 0,
    closeAuthority: props.authority,
    closeAuthorityOption: 1,
    state: AccountState.Initialized,
  }, buffer);

  context.setAccount(props.address, {
    executable: false,
    owner: tokenProgram,
    lamports: LAMPORTS_PER_SOL,
    data: buffer,
  });
}

interface FeeConfigAccountProps {
  initialized?: boolean;
  feeAuthority?: PublicKey;
  feeWithdrawAuthority?: PublicKey;
  feeBps?: number;
}

export async function setFeeConfig(props: FeeConfigAccountProps): Promise<void> {
  const buffer = await packFeeConfig({
    initialized: props.initialized ?? true,
    feeAuthority: props.feeAuthority ?? signerAddress,
    feeWithdrawAuthority: props.feeWithdrawAuthority ?? signerAddress,
    feeBps: props.feeBps ?? 100,
  });
  context.setAccount(feeConfigAddress, {
    executable: false,
    owner: jewlProgramId,
    lamports: LAMPORTS_PER_SOL,
    data: buffer,
  });
}

interface AllocationAccountProps {
  nftMint: PublicKey;
  initialized?: boolean;
  decreaseAuthority?: PublicKey;
  recoverAuthority?: PublicKey;
  firstTokenMint?: PublicKey;
  firstTokenAmount?: bigint;
  secondTokenMint?: PublicKey;
  secondTokenAmount?: bigint;
  thirdTokenMint?: PublicKey;
  thirdTokenAmount?: bigint;
}

export async function setAllocation(props: AllocationAccountProps): Promise<void> {
  const address = allocationAddress(props.nftMint);
  const buffer = await packAllocation({
    initialized: props.initialized ?? true,
    decreaseAuthority: props.decreaseAuthority ?? PublicKey.default,
    recoverAuthority: props.recoverAuthority ?? PublicKey.default,
    firstTokenMint: props.firstTokenMint ?? solMint,
    firstTokenAmount: props.firstTokenAmount ?? 0n,
    secondTokenMint: props.secondTokenMint ?? usdcMint,
    secondTokenAmount: props.secondTokenAmount ?? 0n,
    thirdTokenMint: props.thirdTokenMint ?? usdtMint,
    thirdTokenAmount: props.thirdTokenAmount ?? 0n,
  });
  context.setAccount(address, {
    executable: false,
    owner: jewlProgramId,
    lamports: LAMPORTS_PER_SOL,
    data: buffer,
  });
}

export async function setClock(timestamp: number): Promise<void> {
  const currentClock = await context.banksClient.getClock();
  context.setClock(
    new Clock(
      currentClock.slot,
      currentClock.epochStartTimestamp,
      currentClock.epoch,
      currentClock.leaderScheduleEpoch,
      BigInt(timestamp),
    ),
  );
}

export async function getAccount(address: PublicKey): Promise<AccountInfo<Buffer>> {
  const account = await context.banksClient.getAccount(address);
  if (account == null) { throw new Error(`Account ${address.toBase58()} not found`); }
  const info = { ...account, data: Buffer.from(account.data) };
  return info;
}

export async function getTokenMint(address: PublicKey, programId = tokenProgramId): Promise<Mint> {
  const account = await getAccount(address);
  return unpackMint(address, account, programId);
}

export async function getTokenAccount(address: PublicKey, programId = tokenProgramId): Promise<Account> {
  const account = await getAccount(address);
  return unpackAccount(address, account, programId);
}

export async function getFeeConfig(): Promise<FeeConfigAccount> {
  const account = await getAccount(feeConfigAddress);
  return unpackFeeConfig(feeConfigAddress, account);
}

export async function getAllocation(address: PublicKey): Promise<AllocationAccount> {
  const account = await getAccount(address);
  return unpackAllocation(address, account);
}

export async function testTransaction(txOrIxs: Transaction | VersionedTransaction | Array<TransactionInstruction>, ...signers: Array<Signer>): Promise<BanksTransactionMeta> {
  let tx: Transaction | VersionedTransaction;
  if (Array.isArray(txOrIxs)) {
    const block = await context.banksClient.getLatestBlockhash();
    if (block == null) { throw new Error("Failed to get blockhash"); }
    const message = new TransactionMessage({
      instructions: txOrIxs,
      payerKey: signerAddress,
      recentBlockhash: block[0],
    }).compileToV0Message();
    tx = new VersionedTransaction(message);
  } else {
    tx = txOrIxs;
  }

  if ("version" in tx) {
    tx.sign([testSigner, ...signers]);
  } else {
    tx.sign(testSigner, ...signers);
  }
  return await context.banksClient.processTransaction(tx);
}

export async function startTestRunner(): Promise<void> {
  const programs = [{ name: "jewl", programId: jewlProgramId }];
  context = await startAnchor(".", programs, [], 1000000n);
  context.setAccount(signerAddress, {
    executable: false,
    owner: systemProgramId,
    lamports: LAMPORTS_PER_SOL * 100,
    data: Buffer.alloc(0),
  });
}
