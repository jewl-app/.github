import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useMemo } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useInterval } from "@/app/hooks/interval";
import { getFeeConfig } from "@/core/fee";
import type { PublicKey } from "@solana/web3.js";

export interface UseFeeConfig {
  readonly feeAuthority: PublicKey | null;
  readonly feeWithdrawAuthority: PublicKey | null;
  readonly feeBps: number;
  readonly reload: () => void;
}

export const FeeConfigContext = createContext<UseFeeConfig>({
  feeAuthority: null,
  feeWithdrawAuthority: null,
  feeBps: 0,
  reload: () => { throw new Error("No provider");},
});

export function useFeeConfig(): UseFeeConfig {
  return useContext(FeeConfigContext);
}

export default function FeeConfigProvider(props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();

  const { result, reload } = useInterval({
    interval: 60 * 30, // 30 minutes
    callback: async () => getFeeConfig(connection),
  }, [connection]);

  const context = useMemo(() => {
    return {
      feeAuthority: result?.feeAuthority ?? null,
      feeWithdrawAuthority: result?.feeWithdrawAuthority ?? null,
      feeBps: result?.feeBps ?? 0,
      reload,
    };
  }, [result, reload]);

  return (
    <FeeConfigContext.Provider value={context}>
      {props.children}
    </FeeConfigContext.Provider>
  );
}
