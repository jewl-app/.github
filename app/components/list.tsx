import type { ReactElement } from "react";
import React from "react";
import type { Allocation } from "@/core/allocation";
import { useInitializeAllocationButton } from "@/app/transactions/initialize";
import Button from "@/app/components/button";
import clsx from "clsx";
import FontIcon from "@/app/components/font";

interface AllocationListProps {
  allocations: Array<Allocation>;
}

export default function AllocationList(props: AllocationListProps): ReactElement {
  const { onClick, icon, label } = useInitializeAllocationButton();
  // TODO: list of allocations for the current wallet.
  // button to create a new allocation

  // Show them as cards?

  // Image of the NFT
  // Name of the NFT
  // Total value
  // mint address copyable
  // TokenIcons of the three tokens?

  return (
    <div className="">
      <Button onClick={onClick} className={clsx(
        "px-8 py-2 rounded-full font-bold text-white text-lg",
        "flex flex-row items-center gap-2",
        "bg-emerald-600 dark:bg-emerald-500",
      )}>
        {label}
        <FontIcon icon={icon} className={clsx(
          "w-5 h-5 text-white",
        )} />
      </Button>
      List
      {props.allocations.map(allocation => allocation.address.toBase58())}
    </div>
  );
}
