import type { Account, Mint } from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";
import { useInterval } from "@/app/hooks/interval";
import { useCallback, useMemo } from "react";
import { getTokenMetadata } from "@/core/meta";
import { useConnection } from "@/app/hooks/connection";

type TokenMetadataType = Mint | Account | PublicKey | string;

export interface UseMetadata {
  loading: boolean;
  symbol: (mint: TokenMetadataType) => string | null;
  name: (mint: TokenMetadataType) => string | null;
}

function metadataKey(mint: TokenMetadataType): string {
  if (typeof mint === "string") {
    return mint;
  } else if ("mint" in mint) {
    return mint.mint.toBase58();
  } else if ("address" in mint) {
    return mint.address.toBase58();
  } else {
    return mint.toBase58();
  }
}

export function useTokenMetadata(mints: Array<TokenMetadataType>): UseMetadata {
  const { connection } = useConnection();
  const mappedMints = useMemo(() => mints.map(metadataKey), [mints]);

  const { loading, result: metadataMap } = useInterval({
    interval: 1000 * 60 * 5, // 5 minutes
    callback: async () => {
      return getTokenMetadata(connection, mappedMints);
    },
  }, [connection, mappedMints]);

  const name = useCallback((mint: TokenMetadataType) => {
    return metadataMap?.get(metadataKey(mint))?.name ?? null;
  }, [metadataMap]);

  const symbol = useCallback((mint: TokenMetadataType) => {
    return metadataMap?.get(metadataKey(mint))?.symbol ?? null;
  }, [metadataMap]);

  return { loading, name, symbol };
}

