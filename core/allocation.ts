import type { Connection, PublicKey } from "@solana/web3.js";
import { allocationAddress, associatedTokenAddress, tokenExtensionsProgramId } from "@/core/address";
import type { AllocationAccount } from "@/core/coder";
import { unpackAllocation } from "@/core/coder";
import type { TokenAccount } from "@/core/token";
import { getTokenAccounts, getNonFungibleTokenAccountsForOwner, getTokenAccount } from "@/core/token";
import { getAccountsBatched } from "@/core/account";

export type Allocation = AllocationAccount & TokenAccount & {
  firstToken: TokenAccount | null;
  secondToken: TokenAccount | null;
  thirdToken: TokenAccount | null;
};

export async function getAllocation(connection: Connection, nftMint: PublicKey): Promise<Allocation | null> {
  const address = allocationAddress(nftMint);
  const [tokenAccount, allocationInfo] = await Promise.all([
    getTokenAccount(connection, nftMint, tokenExtensionsProgramId),
    connection.getAccountInfo(address),
  ]);
  if (tokenAccount == null) { return null; }
  if (allocationInfo == null) { return null; }
  const allocation = unpackAllocation(address, allocationInfo);
  const tokenAddresses = [
    associatedTokenAddress(allocation.firstTokenMint, allocation.address),
    associatedTokenAddress(allocation.secondTokenMint, allocation.address),
    associatedTokenAddress(allocation.thirdTokenMint, allocation.address),
  ];
  const [firstToken, secondToken, thirdToken] = await getTokenAccounts(connection, tokenAddresses);
  return { ...tokenAccount, ...allocation, firstToken, secondToken, thirdToken };
}

export async function getAllocations(connection: Connection, walletAddress: PublicKey): Promise<Array<Allocation>> {
  const tokenAccounts = await getNonFungibleTokenAccountsForOwner(connection, walletAddress, tokenExtensionsProgramId);
  const allocationAddresses = tokenAccounts.map(x => allocationAddress(x.mint));
  const allocationInfos = await getAccountsBatched(connection, allocationAddresses);
  const allocationsWithoutTokens: Array<AllocationAccount & TokenAccount> = [];
  for (let i = 0; i < tokenAccounts.length; i++) {
    const allocationInfo = allocationInfos[i];
    if (allocationInfo == null) { continue; }
    const allocation = unpackAllocation(allocationAddresses[i], allocationInfo);
    allocationsWithoutTokens.push({ ...tokenAccounts[i], ...allocation });
  }
  const tokenAddresses = allocationsWithoutTokens.flatMap(x => [
    associatedTokenAddress(x.firstTokenMint, x.address),
    associatedTokenAddress(x.secondTokenMint, x.address),
    associatedTokenAddress(x.thirdTokenMint, x.address),
  ]);
  const tokens = await getTokenAccounts(connection, tokenAddresses);
  const allocations: Array<Allocation> = [];
  for (let i = 0; i < tokens.length; i += 3) {
    const [firstToken, secondToken, thirdToken] = tokens.slice(i, i + 3);
    allocations.push({ ...allocationsWithoutTokens[i / 3], firstToken, secondToken, thirdToken });
  }
  return allocations;
}
