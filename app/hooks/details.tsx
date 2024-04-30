import type { PublicKey } from "@solana/web3.js";
import { useInterval } from "@/app/hooks/interval";
import { useAllocations } from "@/app/hooks/allocations";
import { useMemo } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { faChevronDown, faCoins, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useWallet } from "@/app/hooks/wallet";
import { useFeeConfig } from "./fee";
import { getFeeTokenAccounts } from "@/core/fee";
import { useConnection } from "@/app/hooks/connection";

interface ButtonSpec {
  icon: IconDefinition;
  label: string;
  onClick: () => void;
  enabled: boolean;
}

interface ItemSpec {
  mint: PublicKey;
  name?: string;
  symbol?: string;
  amount: number;
  usdValue: number;
  decimals: number;
}

interface UseDetails {
  readonly loading: boolean;
  readonly items: Array<ItemSpec>;
  readonly buttons: Array<ButtonSpec>;
}

export function useDetails(nftMint?: PublicKey): UseDetails {
  const { connection } = useConnection();
  const { getAllocation, allocations, loading: l1 } = useAllocations();
  const { feeWithdrawAuthority, feeAuthority } = useFeeConfig();
  const { publicKey } = useWallet();

  const ownedAllocations = useMemo(() => {
    return new Set(allocations.map(a => a.address.toBase58()));
  }, [allocations]);

  const { loading: l2, result: allocation } = useInterval({
    interval: 1000 * 30, // 30 seconds
    callback: async () => {
      if (nftMint == null) {
        return null;
      }
      return getAllocation(nftMint);
    },
  }, [nftMint, getAllocation]);

  const { loading: l3, result: _tokenAccounts } = useInterval({
    interval: 1000 * 30, // 30 seconds
    callback: async () => {
      if (nftMint != null) {
        return [];
      }
      return getFeeTokenAccounts(connection);
    },
  }, [nftMint, connection]);

  const buttons = useMemo(() => {
    if (nftMint == null) {
      return [
        {
          icon: faChevronDown,
          label: "Withdraw",
          enabled: allowedPublicKey(publicKey, feeWithdrawAuthority),
          onClick: () => {
            // open withdraw modal
          },
        },
        {
          icon: faCoins,
          label: "Configure",
          enabled: allowedPublicKey(publicKey, feeAuthority),
          onClick: () => {
            // open configure modal to set fee bps
          },
        },
      ];
    } else {
      return [
        {
          icon: faPlus,
          label: "Add",
          enabled: true,
          onClick: () => {
            // open add modal
          },
        },
        {
          icon: faMinus,
          label: "Remove",
          enabled: allowedPublicKey(publicKey, allocation?.decreaseAuthority),
          onClick: () => {
            // open remove modal
          },
        },
        {
          icon: faCoins,
          label: "Exercise",
          enabled: ownedAllocations.has(nftMint.toBase58()),
          onClick: () => {
            // open exercise modal
          },
        },
      ];
    }
  }, [nftMint, ownedAllocations, publicKey, feeWithdrawAuthority, feeAuthority, allocation]);

  const loading = [l1, l2, l3].some(l => l);

  return {
    loading,
    items: [],
    buttons,
  };
}

function allowedPublicKey(publicKey?: PublicKey | null, authority?: PublicKey | null): boolean {
  if (publicKey == null || authority == null) {
    return false;
  }
  return publicKey.equals(authority);
}

