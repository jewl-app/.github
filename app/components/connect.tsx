import type { ReactElement } from "react";
import React, { useCallback, useMemo } from "react";
import type { SupportedWallet } from "@/app/utility/wallet";
import { useWallet } from "@/app/hooks/wallet";
import { useAnalytics } from "@/app/hooks/analytics";
import Image from "next/image";
import Button from "@/app/components/button";

export default function Connect(): ReactElement {
  const { wallets, connect, disconnect } = useWallet();
  const { logEvent, logError } = useAnalytics();

  const connectWallet = useCallback((wallet: SupportedWallet) => {
    logEvent("wallet.connecting", { wallet: wallet.name });
    disconnect()
      .then(() => connect(wallet))
      .then(() => logEvent("wallet.connected", { wallet: wallet.name }))
      .catch(logError);
  }, [wallets, connect, logEvent, logError]);

  const buttons = useMemo(() => {
    return wallets.map(wallet => {
      return (
        <Button className="m-2 basis-5/12" key={wallet.name} onClick={() => connectWallet(wallet)}>
          <div className="pt-2 flex flex-col items-center bg-slate-100 bg-opacity-50 dark:bg-opacity-10 rounded-lg">
            <Image className="rounded-lg" src={wallet.icon} alt={`${wallet.name} logo`} width={32} height={32} />
            <span className="text-center w-full font-bold py-2 px-4">{wallet.name}</span>
          </div>
        </Button>
      );
    });
  }, [wallets]);

  return (
    <>
      <div key="connect" className="text-2xl font-bold pt-2 px-4">
        Connect wallet
      </div>
      <div className="text-xl pb-2 px-4">
        Select your wallet to get started.
      </div>
      <div className="w-full flex flex-wrap items-center justify-around">
        {buttons}
      </div>
      <div className="text-sm py-2 px-4">
        Wallets are provided by third parties and access may depend on these third parties being operational.
      </div>
    </>
  );
}
