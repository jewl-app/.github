import type { Connection, PublicKey } from "@solana/web3.js";
import { allocationAddress, tokenExtensionsProgramId } from "@/core/address";
import type { AllocationAccount } from "@/core/coder";
import { unpackAllocation } from "@/core/coder";
import type { TokenAccount } from "@/core/token";
import { getNonFungibleTokenAccounts, getTokenAccount } from "@/core/token";
import { getMultipleAccountsBatched } from "@/core/account";

export type Allocation = AllocationAccount & TokenAccount;

export async function getAllocation(connection: Connection, nftMint: PublicKey): Promise<Allocation | null> {
  const address = allocationAddress(nftMint);
  const [tokenAccount, allocationInfo] = await Promise.all([
    getTokenAccount(connection, nftMint, tokenExtensionsProgramId),
    connection.getAccountInfo(address),
  ]);
  if (tokenAccount == null) { return null; }
  if (allocationInfo == null) { return null; }
  const allocation = unpackAllocation(address, allocationInfo);
  return { ...tokenAccount, ...allocation };
}

export async function getAllocations(connection: Connection, walletAddress: PublicKey): Promise<Array<Allocation>> {
  const tokenAccounts = await getNonFungibleTokenAccounts(connection, walletAddress, tokenExtensionsProgramId);
  const allocationAddresses = tokenAccounts.map(x => allocationAddress(x.mint));
  const allocationInfos = await getMultipleAccountsBatched(connection, allocationAddresses);
  const allocations: Array<Allocation> = [];
  for (let i = 0; i < tokenAccounts.length; i++) {
    const allocationInfo = allocationInfos[i];
    if (allocationInfo == null) { continue; }
    const allocation = unpackAllocation(allocationAddresses[i], allocationInfo);
    allocations.push({ ...tokenAccounts[i], ...allocation });
  }
  return allocations;
}
