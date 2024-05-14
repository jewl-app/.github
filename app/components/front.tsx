import type { ReactElement } from "react";
import React from "react";
import Button from "@/app/components/button";
import { useInitializeAllocationButton } from "@/app/transactions/initialize";
import clsx from "clsx";
import FontIcon from "@/app/components/font";

export default function Front(): ReactElement {
  const { onClick, icon, label } = useInitializeAllocationButton();

  return (
    <div className="flex flex-1 items-center justify-center">
      {/* Headline */}
      {/* Subline */}
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
      {/* Below the fold extra info */}
      {/* How it works */}
      {/* Carousel of customers */}
    </div>
  );
}
