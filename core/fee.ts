import type { FeeConfigAccount } from "@/core/coder";
import { unpackFeeConfig } from "@/core/coder";
import type { Connection } from "@solana/web3.js";
import { feeConfigAddress } from "@/core/address";
import type { TokenAccount } from "@/core/token";
import { getTokenAccounts } from "@/core/token";

export async function getFeeConfig(connection: Connection): Promise<FeeConfigAccount> {
  const accountInfo = await connection.getAccountInfo(feeConfigAddress);
  if (accountInfo == null) {
    throw new Error("Fee config account not found");
  }
  return unpackFeeConfig(feeConfigAddress, accountInfo);
}

interface FeeTokenAccount extends TokenAccount {
  isAta: boolean;
}

export async function getFeeTokenAccounts(connection: Connection): Promise<Array<FeeTokenAccount>> {
  const accounts = await getTokenAccounts(connection, feeConfigAddress);
  return accounts.map(x => {
    return {
      ...x,
      isAta: x.owner.equals(feeConfigAddress),
    };
  });
}
