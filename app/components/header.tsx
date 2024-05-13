import type { ReactElement } from "react";
import React, { useCallback, useEffect, useMemo } from "react";
import { useAnalytics } from "@/app/hooks/analytics";
import { usePopup } from "@/app/hooks/popup";
import { useCluster } from "@/app/hooks/cluster";
import { useWallet } from "@/app/hooks/wallet";
import { useBalance } from "@/app/hooks/balance";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useWindowMode } from "@/app/hooks/mode";
import Button from "@/app/components/button";
import Link from "next/link";

const Connect = dynamic(async () => import("@/app/components/connect"));

export default function Header(): ReactElement {
  const { publicKey } = useWallet();
  const { balance } = useBalance();
  const { cluster } = useCluster();
  const { logEvent } = useAnalytics();
  const { openPopup, closePopup } = usePopup();
  const { mode } = useWindowMode();

  const connectText = useMemo(() => {
    if (publicKey == null) { return "Connect"; }
    const prefix = publicKey.toBase58().slice(0, 4);
    const suffix = publicKey.toBase58().slice(-4);
    const key = `${prefix}...${suffix}`;
    return `${key} (◎${balance.toFixed(2)})`;
  }, [publicKey, balance]);

  const clusterText = useMemo(() => {
    switch (cluster) {
      case "testnet": return "TESTNET";
      case "devnet": return "DEVNET";
      case "localnet": return "LOCALNET";
      default: return null;
    }
  }, [cluster]);

  useEffect(() => {
    if (publicKey != null) {
      closePopup();
    }
  }, [publicKey, closePopup]);

  const loginPressed = useCallback(() => {
    logEvent("wallet.popup");
    openPopup(<Connect />);
  }, [publicKey, openPopup, logEvent]);

  return (
    <div className="relative w-full flex items-center justify-between">
      <Link className="p-1 mx-3" href="/">
        <Image src={`/image/logo/${mode}`} alt="jewl logo" width={48} height={48} />
      </Link>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">{clusterText}</div>
      <Button className="px-4 py-2 m-2 font-bold uppercase" onClick={loginPressed}>
        {connectText}
      </Button>
    </div>
  );
}
