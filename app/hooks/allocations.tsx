import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useConnection } from "@/app/hooks/connection";
import { useInterval } from "@/app/hooks/interval";
import { useWallet } from "@/app/hooks/wallet";
import type { Allocation } from "@/core/allocation";
import { getAllocations } from "@/core/allocation";
import type { PublicKey } from "@solana/web3.js";

export interface UseAllocations {
  readonly allocations: Array<Allocation>;
  readonly loading: boolean;
  getAllocation: (nftMint: PublicKey) => Promise<Allocation | null>;
}

export const AllocationContext = createContext<UseAllocations>({
  allocations: [],
  loading: false,
  getAllocation: async () => Promise.reject(new Error("No provider")),
});

export function useAllocations(): UseAllocations {
  return useContext(AllocationContext);
}

export default function AllocationProvider(props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const { loading, result } = useInterval({
    interval: 1000 * 30, // 30 seconds,
    callback: async () => {
      if (publicKey == null) {
        return [];
      }
      return getAllocations(connection, publicKey);
    },
  }, [publicKey, connection, getAllocations]);

  const allocations = result ?? [];

  const getAllocation = useCallback(async (nftMint: PublicKey) => {
    const allocation = allocations.find(x => x.mint.equals(nftMint));
    if (allocation != null) {
      return allocation;
    }
    return getAllocation(nftMint);
  }, [result]);

  const context = useMemo(() => {
    return { allocations, getAllocation, loading };
  }, [allocations, getAllocation, loading]);

  return (
    <AllocationContext.Provider value={context}>
      {props.children}
    </AllocationContext.Provider>
  );
}
