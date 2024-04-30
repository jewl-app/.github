import type { PublicKey } from "@solana/web3.js";
import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { useDetails } from "@/app/hooks/details";
import DonutChart from "@/app/components/donut";
import Spinner from "@/app/components/spinner";
import FontIcon from "@/app/components/font";
import Button from "@/app/components/button";
import clsx from "clsx";

interface AllocationProps {
  nftMint?: PublicKey;
}

export default function AllocationDetails(props: AllocationProps): ReactElement {
  const { items, buttons, loading } = useDetails(props.nftMint);

  const donutItems = useMemo(() => {
    // TODO: prices, token metadata
    return new Map(items?.map(t => [
      t.mint.toBase58(),
      Number(t.amount),
    ]));
  }, [items]);

  const totalValue = useMemo(() => {
    // TODO: prices
    return items?.reduce((acc, t) => acc + Number(t.amount), 0);
  }, [items]);

  const buttonElements = useMemo(() => {
    // TODO: Tooltip on hover disable?
    return buttons.map(button => (
      <Button
        key={button.label}
        className="flex flex-col items-center"
        onClick={button.onClick}
        disabled={!button.enabled}
      >
        <FontIcon icon={button.icon} className={clsx(
          "w-10 h-10 p-2 rounded-full border-2",
          button.enabled ? "text-emerald-600 dark:text-emerald-500" : "text-slate-600 dark:text-slate-400",
          button.enabled ? "border-emerald-600 dark:border-emerald-500" : "border-slate-600 dark:border-slate-400",
        )} />
        <span className="text-sm">{button.label}</span>
      </Button>
    ));
  }, [buttons]);

  if (loading && items == null) {
    return <Spinner className="my-auto" />;
  }

  // TODO: list of the tokens
  // Token icon, name + price, <->, amount-symbol + usd value

  return (
    <>
      <span className="text-6xl font-bold">${totalValue?.toFixed(2)}</span>
      <DonutChart className="w-[40vh] max-w-[90%]" data={donutItems} />
      <div className="py-2 flex gap-4">
        {buttonElements}
      </div>
    </>
  );
}
