import type { Account, Mint } from "@solana/spl-token";
import { unpackAccount, unpackMint } from "@solana/spl-token";
import type { Connection, PublicKey } from "@solana/web3.js";
import { getAccountsBatched } from "@/core/account";
import { tokenProgramId } from "@/core/address";
import { nonNull } from "@/core/array";

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

export async function getTokenAccounts(connection: Connection, accountAddresses: Array<PublicKey>, programId = tokenProgramId): Promise<Array<TokenAccount | null>> {
  const accountInfos = await getAccountsBatched(connection, accountAddresses);
  const tokenAccounts = accountInfos
    .filter(nonNull)
    .map((x, i) => unpackAccount(accountAddresses[i], x, programId));
  const mintAddresses = tokenAccounts.map(x => x.mint);
  const mintInfos = await getAccountsBatched(connection, mintAddresses);
  const accounts: Array<TokenAccount | null> = [];
  for (let i = 0; i < accountAddresses.length; i++) {
    const mintInfo = mintInfos[i];
    if (mintInfo == null) { continue; }
    const mint = unpackMint(accountAddresses[i], mintInfo);
    accounts.push({ ...tokenAccounts[i], ...mint });
  }
  return accounts;
}

export async function getTokenAccountsForOwner(connection: Connection, owner: PublicKey, programId = tokenProgramId): Promise<Array<TokenAccount>> {
  const accountInfos = await connection.getTokenAccountsByOwner(owner, { programId });
  const tokenAccounts = accountInfos.value.map(x => unpackAccount(x.pubkey, x.account, programId));
  const mints = await getAccountsBatched(connection, tokenAccounts.map(x => x.mint));
  const accounts: Array<TokenAccount> = [];
  for (let i = 0; i < tokenAccounts.length; i++) {
    const mintInfo = mints[i];
    if (mintInfo == null) { continue; }
    const mint = unpackMint(tokenAccounts[i].mint, mintInfo);
    accounts.push({ ...tokenAccounts[i], ...mint });
  }
  return accounts;
}

export async function getFungibleTokenAccountsForOwner(connection: Connection, owner: PublicKey, programId = tokenProgramId): Promise<Array<TokenAccount>> {
  const tokenAccounts = await getTokenAccountsForOwner(connection, owner, programId);
  return tokenAccounts.filter(x => x.supply > 1n);
}

export async function getNonFungibleTokenAccountsForOwner(connection: Connection, owner: PublicKey, programId = tokenProgramId): Promise<Array<TokenAccount>> {
  const tokenAccounts = await getTokenAccountsForOwner(connection, owner, programId);
  return tokenAccounts.filter(x => x.supply === 1n);
}
