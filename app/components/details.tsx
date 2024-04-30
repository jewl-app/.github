import type { PublicKey } from "@solana/web3.js";
import type { ReactElement } from "react";
import React from "react";
import { useDetails } from "@/app/hooks/details";

interface AllocationProps {
  nftMint?: PublicKey;
}

export default function AllocationDetails(props: AllocationProps): ReactElement {
  const {} = useDetails(props.nftMint);

  // USD value
  // Pie chart with legend
  // Action circle buttons. (add, remove, exercise) if allocation, (withdraw) if treasury
  // Disabled if not right wallet connected?

  return (
    <div className="">
      Allocation {props.nftMint?.toBase58()}
    </div>
  );
}
