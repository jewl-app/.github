import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useInterval } from "@/app/hooks/interval";
import type { FeeConfigAccount } from "@/core/coder";
import { getFeeConfig } from "@/core/fee";

export type UseFeeConfig = Partial<Pick<FeeConfigAccount, "feeAuthority" | "feeWithdrawAuthority" | "feeBps">>;

export const FeeConfigContext = createContext<UseFeeConfig>({});

export function useFeeConfig(): UseFeeConfig {
  return useContext(FeeConfigContext);
}

export default function FeeConfigProvider(props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();

  const { result } = useInterval({
    interval: 1000 * 60 * 30, // 30 minutes
    callback: async () => getFeeConfig(connection),
  }, [connection]);

  return (
    <FeeConfigContext.Provider value={result ?? {}}>
      {props.children}
    </FeeConfigContext.Provider>
  );
}
