import { PublicKey } from "@solana/web3.js";
import { useInterval } from "@/app/hooks/interval";
import { useAllocations } from "@/app/hooks/allocations";
import { useMemo } from "react";
import { getFeeTokenAccounts } from "@/core/fee";
import { useConnection } from "@/app/hooks/connection";
import { TokenAccount } from "@/core/token";
import { useIncreaseAllocationButton } from "@/app/transactions/increase";
import { useDecreaseAllocationButton } from "@/app/transactions/decrease";
import { useExerciseAllocationButton } from "@/app/transactions/exercise";
import { useConfigureFeesButton } from "@/app/transactions/configure";
import { useWithdrawFeesButton } from "@/app/transactions/withdraw";
import { ButtonSpec } from "@/app/transactions/spec";

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

  const buttonCtx = useMemo(() => ({
    reload: () => [r1, r2].forEach(r => r()),
    value: allocation ?? tokenAccounts
  }), [r1, r2, items]);

  const withdrawFeesButton = useWithdrawFeesButton(buttonCtx);
  const configureFeesButton = useConfigureFeesButton(buttonCtx);
  const increaseAllocationButton = useIncreaseAllocationButton(buttonCtx);
  const decreaseAllocationButton = useDecreaseAllocationButton(buttonCtx);
  const exerciseAllocationButton = useExerciseAllocationButton(buttonCtx);

  const buttons = useMemo(() => {
    if (nftMint == null) {
      return [withdrawFeesButton, configureFeesButton ];
    } else {
      return [increaseAllocationButton, decreaseAllocationButton, exerciseAllocationButton];
    }
  }, [nftMint, withdrawFeesButton, configureFeesButton, increaseAllocationButton, decreaseAllocationButton, exerciseAllocationButton]);

  const loading = [l1, l2, l3].some(l => l);

  return { loading, items, buttons };
}
