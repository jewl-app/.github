import type { ReactElement } from "react";
import React from "react";
import type { Allocation } from "@/core/allocation";

interface AllocationListProps {
  allocations: Array<Allocation>;
}

export default function AllocationList(props: AllocationListProps): ReactElement {
  // list of allocations for the current wallet.
  // button to create a new allocation

  return (
    <div className="">
      List
      {props.allocations.map(allocation => allocation.address.toBase58())}
    </div>
  );
}
