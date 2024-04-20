import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useAnalytics } from "@/app/hooks/analytics";
import { useInterval } from "@/app/hooks/interval";
import { useWallet } from "@/app/hooks/wallet";
import { Allocation, getAllocations } from "@/core/allocation";
import { PublicKey } from "@solana/web3.js";

export interface UseAllocations {
  readonly allocations: Array<Allocation>;
  getAllocation: (nftMint: PublicKey) => Promise<Allocation | null>;
}

export const AllocationContext = createContext<UseAllocations>({
  allocations: [],
  getAllocation: async () => Promise.reject(new Error("No provider")),
});

export function useAllocations (): UseAllocations {
  return useContext(AllocationContext);
}

const refreshInterval = 1000 * 30;

export default function AllocationProvider (props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { logError } = useAnalytics();
  const [allocations, setAllocations] = useState<Array<Allocation>>([]);

  useEffect(() => {
    setAllocations([]);
  }, [publicKey, setAllocations]);

  useInterval(refreshInterval, () => {
    if (publicKey == null) {
      setAllocations([]);
      return;
    }
    getAllocations(connection, publicKey)
      .then(setAllocations)
      .catch(error => {
        logError(error);
        setAllocations([]);
      });
  }, [publicKey, setAllocations, logError, connection]);

  const getAllocation = useCallback(async (nftMint: PublicKey) => {
    const allocation = allocations.find(allocation => allocation.mint.equals(nftMint));
    if (allocation != null) {
      return allocation;
    }
    return getAllocation(nftMint);
  }, [allocations]);

  const context = useMemo(() => {
    return { allocations, getAllocation };
  }, [allocations, getAllocation]);

  return (
    <AllocationContext.Provider value={context}>
      {props.children}
    </AllocationContext.Provider>
  );
}
