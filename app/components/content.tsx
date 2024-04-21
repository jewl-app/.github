import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import { useWallet } from "@/app/hooks/wallet";
import { PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Front = dynamic(() => import("@/app/components/front"), { loading: () => <div className="flex-1" /> });
const Allocation = dynamic(() => import("@/app/components/allocation"), { loading: () => <div className="flex-1" /> });
const List = dynamic(() => import("@/app/components/list"), { loading: () => <div className="flex-1" /> });

export default function Content(): ReactElement {
  const { publicKey } = useWallet();
  const query = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [content, setContent] = useState<ReactElement>();

  useEffect(() => {
    try {
      if (query.size !== 1) {
        throw new Error();
      }
      const key = query.keys().next().value;
      if (key === "admin") {
        setContent(<Allocation />);
      } else {
        const nftMint = new PublicKey(key);
        setContent(<Allocation nftMint={nftMint} />);
      }
    } catch (error) {
      router.replace(path);
      setContent(publicKey == null ? <Front /> : <List />);
    }
  }, [query, publicKey]);

  return (
    <div className="flex flex-1 items-center justify-center w-screen overflow-y-auto">
      <div className="max-w-lg w-screen h-full flex flex-col">
        {content}
      </div>
    </div>
  );
}
