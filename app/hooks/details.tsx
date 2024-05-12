import type { PublicKey } from "@solana/web3.js";
import { useInterval } from "@/app/hooks/interval";
import { useAllocations } from "@/app/hooks/allocations";
import { useCallback, useMemo } from "react";
import { getFeeTokenAccounts } from "@/core/fee";
import { useConnection } from "@/app/hooks/connection";
import type { TokenAccount } from "@/core/token";
import { useIncreaseAllocationButton } from "@/app/transactions/increase";
import { useDecreaseAllocationButton } from "@/app/transactions/decrease";
import { useExerciseAllocationButton } from "@/app/transactions/exercise";
import { useConfigureFeesButton } from "@/app/transactions/configure";
import { useWithdrawFeesButton } from "@/app/transactions/withdraw";
import type { ButtonSpec } from "@/app/transactions/spec";

interface UseDetails {
  readonly loading: boolean;
  readonly items: Array<TokenAccount> | null;
  readonly buttons: Array<ButtonSpec>;
}

export function useDetails(nftMint?: PublicKey): UseDetails {
  const { connection } = useConnection();
  const { getAllocation, loading: l1 } = useAllocations();

  const { loading: l2, result: allocation, reload: r1 } = useInterval({
    interval: 1000 * 30, // 30 seconds
    callback: async () => {
      if (nftMint == null) {
        return null;
      }
      return getAllocation(nftMint);
    },
  }, [nftMint, getAllocation]);

  const { loading: l3, result: tokenAccounts, reload: r2 } = useInterval({
    interval: 1000 * 30, // 30 seconds
    callback: async () => {
      if (nftMint != null) {
        return null;
      }
      return getFeeTokenAccounts(connection);
    },
  }, [nftMint, connection]);

  const items = useMemo(() => {
    if (nftMint == null && tokenAccounts != null) {
      return tokenAccounts;
    } else if (allocation != null) {
      // Override the amounts since the redeemable amount is stored in the allocation
      // and does not have to match the token account balance
      const tokens: Array<TokenAccount> = [];
      if (allocation.firstToken != null) {
        tokens.push({ ...allocation.firstToken, amount: allocation.firstTokenAmount });
      }
      if (allocation.secondToken != null) {
        tokens.push({ ...allocation.secondToken, amount: allocation.secondTokenAmount });
      }
      if (allocation.thirdToken != null) {
        tokens.push({ ...allocation.thirdToken, amount: allocation.thirdTokenAmount });
      }
      return tokens;
    }
    return null;
  }, [nftMint, allocation, tokenAccounts]);

  const reload = useCallback(() => [r1, r2].forEach(r => r()), [r1, r2]);
  const withdrawFeesButton = useWithdrawFeesButton({ reload, value: tokenAccounts });
  const configureFeesButton = useConfigureFeesButton({ reload, value: tokenAccounts });
  const increaseAllocationButton = useIncreaseAllocationButton({ reload, value: allocation });
  const decreaseAllocationButton = useDecreaseAllocationButton({ reload, value: allocation });
  const exerciseAllocationButton = useExerciseAllocationButton({ reload, value: allocation });

  const buttons = useMemo(() => {
    if (nftMint == null) {
      return [withdrawFeesButton, configureFeesButton];
    } else {
      return [increaseAllocationButton, decreaseAllocationButton, exerciseAllocationButton];
    }
  }, [nftMint, withdrawFeesButton, configureFeesButton, increaseAllocationButton, decreaseAllocationButton, exerciseAllocationButton]);

  const loading = useMemo(() => [l1, l2, l3].some(l => l), [l1, l2, l3]);

  return { loading, items, buttons };
}
