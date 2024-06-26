import type { Account, Mint } from "@solana/spl-token";
import type { PublicKey } from "@solana/web3.js";
import { useInterval } from "@/app/hooks/interval";
import { getTokenPrices } from "@/core/price";
import { useCallback, useMemo } from "react";
import { cached } from "@/core/cache";

type TokenPriceType = Mint | Account | PublicKey | string;

export interface UsePrices {
  loading: boolean;
  reload: () => void;
  price: (mint: TokenPriceType) => number | null;
}

function priceKey(mint: TokenPriceType): string {
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

export function useTokenPrices(mints: Array<TokenPriceType>): UsePrices {
  const mappedMints = useMemo(() => mints.map(priceKey), [mints]);

  const { loading, result: priceMap, reload } = useInterval({
    interval: 60 * 5, // 5 minutes
    callback: async () => cached({
      key: "token-prices",
      handler: async () => getTokenPrices(mappedMints),
    }),
  }, [mappedMints]);

  const price = useCallback((mint: TokenPriceType) => {
    return priceMap?.get(priceKey(mint)) ?? null;
  }, [priceMap]);

  return { loading, price, reload };
}

