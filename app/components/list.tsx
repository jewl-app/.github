import type { ReactElement } from "react";
import React from "react";
import { useAllocations } from "@/app/hooks/allocations";

export default function Allocation (): ReactElement {
  const { allocations } = useAllocations();

  // list of allocations for the current wallet.
  // button to create a new allocation

  return (
    <div className="">
      List
    </div>
  );
}
