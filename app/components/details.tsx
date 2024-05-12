import type { PublicKey } from "@solana/web3.js";
import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { useDetails } from "@/app/hooks/details";
import DonutChart from "@/app/components/donut";
import Spinner from "@/app/components/spinner";
import FontIcon from "@/app/components/font";
import Button from "@/app/components/button";
import clsx from "clsx";
import { useTokenPrices } from "@/app/hooks/price";
import { toNumber } from "@/core/number";
import type { TokenAccount } from "@/core/token";
import { useTokenMetadata } from "@/app/hooks/meta";
import { ButtonSpec } from "../transactions/spec";

interface AllocationProps {
  nftMint?: PublicKey;
}

function tokenValue(account: TokenAccount, price: (mint: TokenAccount) => number | null): number {
  return toNumber(account.amount, account.decimals) * (price(account) ?? 0);
}

function buttonDisabled(spec: ButtonSpec): boolean {
  if (spec.disabled == null) {
    return false;
  }
  if (typeof spec.disabled === "string") {
    return true;
  }
  return spec.disabled;
}

export default function AllocationDetails(props: AllocationProps): ReactElement {
  const { items, buttons, loading } = useDetails(props.nftMint);
  const mints = useMemo(() => items?.map(t => t.mint) ?? [], [items]);
  const { price } = useTokenPrices(mints);
  const { name, symbol } = useTokenMetadata(mints);

  const donutItems = useMemo(() => {
    return new Map(items?.map(t => [
      `${name(t)} (${symbol(t)})`,
      tokenValue(t, price),
    ]));
  }, [items, name, price, symbol]);

  const totalValue = useMemo(() => {
    return items?.reduce((acc, t) => acc + tokenValue(t, price), 0);
  }, [items, price]);

  const buttonElements = useMemo(() => {
    return buttons.map(button => (
      <Button
        key={button.label}
        className="flex flex-col items-center"
        onClick={button.onClick}
        disabled={buttonDisabled(button)}
        title={typeof button.disabled === "string" ? button.disabled : undefined}
      >
        <FontIcon icon={button.icon} className={clsx(
          "w-10 h-10 p-2 rounded-full border-2",
          !buttonDisabled(button) ? "text-emerald-600 dark:text-emerald-500" : "text-slate-600 dark:text-slate-400",
          !buttonDisabled(button) ? "border-emerald-600 dark:border-emerald-500" : "border-slate-600 dark:border-slate-400",
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
