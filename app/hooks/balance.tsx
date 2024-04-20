import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useAnalytics } from "@/app/hooks/analytics";
import { useInterval } from "@/app/hooks/interval";
import { useWallet } from "@/app/hooks/wallet";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export interface UseBalance {
  readonly balance: number;
}

export const BalanceContext = createContext<UseBalance>({
  balance: 0,
});

export function useBalance (): UseBalance {
  return useContext(BalanceContext);
}

const refreshInterval = 1000 * 30;

export default function BalanceProvider (props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { logError } = useAnalytics();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    setBalance(0);
  }, [publicKey, setBalance]);

  useInterval(refreshInterval, () => {
    if (publicKey == null) {
      setBalance(0);
      return;
    }
    connection.getBalance(publicKey)
      .then(balance => setBalance(balance / LAMPORTS_PER_SOL))
      .catch(error => {
        logError(error);
        setBalance(0);
      });
  }, [publicKey, setBalance, logError, connection]);

  const context = useMemo(() => {
    return { balance };
  }, [balance]);

  return (
    <BalanceContext.Provider value={context}>
      {props.children}
    </BalanceContext.Provider>
  );
}
