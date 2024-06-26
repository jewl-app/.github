import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useMemo } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useInterval } from "@/app/hooks/interval";
import { useWallet } from "@/app/hooks/wallet";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export interface UseBalance {
  readonly balance: number;
  readonly loading: boolean;
  reload: () => void;
}

export const BalanceContext = createContext<UseBalance>({
  balance: 0,
  loading: false,
  reload: () => { throw new Error("No provider"); },
});

export function useBalance(): UseBalance {
  return useContext(BalanceContext);
}

export default function BalanceProvider(props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { loading, result, reload } = useInterval({
    interval: 30, // 30 seconds,
    callback: async () => {
      if (publicKey == null) {
        return 0;
      }
      return connection.getBalance(publicKey)
        .then(balance => balance / LAMPORTS_PER_SOL);
    },
  }, [publicKey, connection]);

  const balance = result ?? 0;

  const context = useMemo(() => {
    return { balance, loading, reload };
  }, [balance, loading, reload]);

  return (
    <BalanceContext.Provider value={context}>
      {props.children}
    </BalanceContext.Provider>
  );
}
