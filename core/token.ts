import type { Account, Mint } from "@solana/spl-token";
import { unpackAccount, unpackMint } from "@solana/spl-token";
import type { Connection, PublicKey } from "@solana/web3.js";
import { getMultipleAccountsBatched } from "@/core/account";
import { tokenProgramId } from "@/core/address";

export type TokenAccount = Account & Mint;

export async function getTokenAccount(connection: Connection, accountAddress: PublicKey, programId = tokenProgramId): Promise<TokenAccount | null> {
  const accountInfo = await connection.getAccountInfo(accountAddress);
  if (accountInfo == null) { return null; }
  const account = unpackAccount(accountAddress, accountInfo, programId);
  const mintInfo = await connection.getAccountInfo(account.mint);
  if (mintInfo == null) { return null; }
  const mint = unpackMint(account.mint, mintInfo);
  return { ...account, ...mint };
}

export async function getTokenAccounts(connection: Connection, walletAddress: PublicKey, programId = tokenProgramId): Promise<Array<TokenAccount>> {
  const accountInfos = await connection.getTokenAccountsByOwner(walletAddress, { programId });
  const tokenAccounts = accountInfos.value.map(x => unpackAccount(x.pubkey, x.account, programId));
  const mints = await getMultipleAccountsBatched(connection, tokenAccounts.map(x => x.mint));
  const accounts: Array<TokenAccount> = [];
  for (let i = 0; i < tokenAccounts.length; i++) {
    const mintInfo = mints[i];
    if (mintInfo == null) { continue; }
    const mint = unpackMint(tokenAccounts[i].mint, mintInfo);
    accounts.push({ ...tokenAccounts[i], ...mint });
  }
  return accounts;
}

export async function getFungibleTokenAccounts(connection: Connection, walletAddress: PublicKey, programId = tokenProgramId): Promise<Array<TokenAccount>> {
  const tokenAccounts = await getTokenAccounts(connection, walletAddress, programId);
  return tokenAccounts.filter(x => x.supply > 1n);
}

export async function getNonFungibleTokenAccounts(connection: Connection, walletAddress: PublicKey, programId = tokenProgramId): Promise<Array<TokenAccount>> {
  const tokenAccounts = await getTokenAccounts(connection, walletAddress, programId);
  return tokenAccounts.filter(x => x.supply === 1n);
}
