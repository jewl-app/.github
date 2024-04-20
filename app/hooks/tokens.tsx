import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useAnalytics } from "@/app/hooks/analytics";
import { useInterval } from "@/app/hooks/interval";
import { useWallet } from "@/app/hooks/wallet";
import { TokenAccount, getFungibleTokenAccounts } from "@/core/token";

export interface UseTokens {
  readonly tokenAccounts: Array<TokenAccount>;
}

export const TokensContext = createContext<UseTokens>({
  tokenAccounts: [],
});

export function useTokens(): UseTokens {
  return useContext(TokensContext);
}

const refreshInterval = 1000 * 30;

export default function TokensProvider(props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { logError } = useAnalytics();
  const [tokenAccounts, setTokenAccounts] = useState<Array<TokenAccount>>([]);

  useEffect(() => {
    setTokenAccounts([]);
  }, [publicKey, setTokenAccounts]);

  useInterval(refreshInterval, () => {
    if (publicKey == null) {
      setTokenAccounts([]);
      return;
    }
    getFungibleTokenAccounts(connection, publicKey)
      .then(setTokenAccounts)
      .catch(error => {
        logError(error);
        setTokenAccounts([]);
      });
  }, [publicKey, setTokenAccounts]);

  const context = useMemo(() => {
    return { tokenAccounts };
  }, [tokenAccounts]);

  return (
    <TokensContext.Provider value={context}>
      {props.children}
    </TokensContext.Provider>
  );
}
