import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useMemo } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useInterval } from "@/app/hooks/interval";
import { useWallet } from "@/app/hooks/wallet";
import type { TokenAccount } from "@/core/token";
import { getFungibleTokenAccountsForOwner } from "@/core/token";

export interface UseTokens {
  readonly loading: boolean;
  readonly tokenAccounts: Array<TokenAccount>;
}

export const TokensContext = createContext<UseTokens>({
  loading: false,
  tokenAccounts: [],
});

export function useTokens(): UseTokens {
  return useContext(TokensContext);
}

export default function TokensProvider(props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { result, loading } = useInterval({
    interval: 30, // 30 seconds
    callback: async () => {
      if (publicKey == null) {
        return [];
      }
      return getFungibleTokenAccountsForOwner(connection, publicKey);
    },
  }, [publicKey, connection]);

  const tokenAccounts = result ?? [];

  const context = useMemo(() => {
    return { tokenAccounts, loading };
  }, [tokenAccounts, loading]);

  return (
    <TokensContext.Provider value={context}>
      {props.children}
    </TokensContext.Provider>
  );
}
