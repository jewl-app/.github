import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import { useWallet } from "@/app/hooks/wallet";
import { PublicKey } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAllocations } from "@/app/hooks/allocations";
import Spinner from "@/app/components/spinner";

const Front = dynamic(async () => import("@/app/components/front"), { loading: () => <div className="flex-1" /> });
const Details = dynamic(async () => import("@/app/components/details"), { loading: () => <div className="flex-1" /> });
const List = dynamic(async () => import("@/app/components/list"), { loading: () => <div className="flex-1" /> });

export default function Content(): ReactElement {
  const { publicKey } = useWallet();
  const query = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const { allocations, loading } = useAllocations();
  const [content, setContent] = useState<ReactElement>();

  useEffect(() => {
    try {
      if (query.size !== 1) {
        throw new Error();
      }
      const key = query.keys().next().value as unknown;
      if (typeof key !== "string") {
        throw new Error();
      }
      if (key === "treasury") {
        setContent(<Details />);
      } else {
        const nftMint = new PublicKey(key);
        setContent(<Details nftMint={nftMint} />);
      }
    } catch (error) {
      router.replace(path);
      if (loading) {
        setContent(<Spinner type="circle" />);
      } else if (allocations.length === 0) {
        setContent(<Front />);
      } else {
        setContent(<List allocations={allocations} />);
      }
    }
  }, [query, publicKey, allocations, path, router, loading]);

  return (
    <div className="flex flex-1 items-center justify-center w-screen overflow-y-auto">
      <div className="relative max-w-lg w-screen h-full flex flex-col items-center justify-center gap-4">
        {content}
      </div>
    </div>
  );
}
