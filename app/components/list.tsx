import type { ReactElement } from "react";
import React from "react";
import type { Allocation } from "@/core/allocation";

interface AllocationListProps {
  allocations: Array<Allocation>;
}

export default function AllocationList(props: AllocationListProps): ReactElement {
  // TODO:
  // list of allocations for the current wallet.
  // button to create a new allocation

  // Show them as cards?

  // Image of the NFT
  // Name of the NFT
  // Total value
  // mint address copyable
  // TokenIcons of the three tokens?

  return (
    <div className="">
      List
      {props.allocations.map(allocation => allocation.address.toBase58())}
    </div>
  );
}
