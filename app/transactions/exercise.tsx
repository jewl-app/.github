import { faCoins } from "@fortawesome/free-solid-svg-icons";
import type { AllocationButtonContext, ButtonSpec } from "@/app/transactions/spec";
import dynamic from "next/dynamic";
import { useWallet } from "@/app/hooks/wallet";
import { usePopup } from "@/app/hooks/popup";
import { useAllocations } from "@/app/hooks/allocations";
import { useCallback, useMemo } from "react";
import type { Mint } from "@solana/spl-token";
import type { FormFieldMeta } from "@/app/form/field";
import { createExerciseAllocationInstruction } from "@/core/instruction";
import { useTransaction } from "@/app/hooks/transaction";
import { shortAddress } from "@/core/address";
import { nonNull } from "@/core/array";
import { useTokenMetadata } from "@/app/hooks/meta";
import { useAnalytics } from "@/app/hooks/analytics";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useExerciseAllocationButton(ctx: AllocationButtonContext): ButtonSpec {
  const { value: allocation } = ctx;
  const { publicKey } = useWallet();
  const { openPopup } = usePopup();
  const { logEvent } = useAnalytics();
  const { allocations } = useAllocations();
  const { sendTransaction } = useTransaction();

  const ownedAllocations = useMemo(() => {
    return new Set(allocations.map(a => a.address.toBase58()));
  }, [allocations]);

  const allocationAddress = useMemo(() => {
    return allocation?.address.toBase58() ?? "";
  }, [allocation]);

  const tokenMap = useMemo(() => {
    const map = new Map<string, Mint>();
    if (allocation?.firstToken) {
      map.set(allocation.firstTokenMint.toBase58(), allocation.firstToken);
    }
    if (allocation?.secondToken) {
      map.set(allocation.secondTokenMint.toBase58(), allocation.secondToken);
    }
    if (allocation?.thirdToken) {
      map.set(allocation.thirdTokenMint.toBase58(), allocation.thirdToken);
    }
    return map;
  }, [allocation]);

  const amountMap = useMemo(() => {
    const map = new Map<string, bigint>();
    if (allocation?.firstToken) {
      map.set(allocation.firstTokenMint.toBase58(), allocation.firstTokenAmount);
    }
    if (allocation?.secondToken) {
      map.set(allocation.secondTokenMint.toBase58(), allocation.secondTokenAmount);
    }
    if (allocation?.thirdToken) {
      map.set(allocation.thirdTokenMint.toBase58(), allocation.thirdTokenAmount);
    }
    return map;
  }, [allocation]);

  const tokenMints = useMemo(() => [
    allocation?.firstTokenMint,
    allocation?.secondTokenMint,
    allocation?.thirdTokenMint,
  ].filter(nonNull), [tokenMap]);

  const { symbol } = useTokenMetadata(tokenMints);

  const formCompletion = useCallback(async () => {
    if (publicKey == null || allocation == null) {
      throw new Error("No wallet");
    }
    logEvent("exercise.completed");
    const instruction = createExerciseAllocationInstruction({
      payer: publicKey,
      nftMint: allocation.address,
      firstTokenMint: allocation.firstTokenMint,
      secondTokenMint: allocation.secondTokenMint,
      thirdTokenMint: allocation.thirdTokenMint,
    });
    const hash = await sendTransaction([instruction]);
    // FIXME: page will no longer exist? cause allocation does not exist
    return hash;
  }, [publicKey, allocation, sendTransaction, logEvent]);

  const openForm = useCallback(() => {
    const fields: Array<FormFieldMeta> = Array.from(tokenMap.keys()).map(x => ({
      type: "info", title: `${symbol(x)} (${shortAddress(x)})`, value: amountMap.get(x)?.toString(),
    }));
    logEvent("exercise.opened");
    openPopup(
      <Form
        title="Exercise allocation"
        subtitle="Exchange your jewl nft for the allocated tokens. Exercising might have tax implications."
        button="Continue"
        fields={fields}
        onComplete={formCompletion}
      />,
    );
  }, [tokenMap, openPopup, formCompletion, logEvent, symbol, amountMap]);

  const enabled = ownedAllocations.has(allocationAddress);

  return {
    icon: faCoins,
    label: "Exchange",
    disabled: enabled ? false : "Connect using the wallet that owns this allocation.",
    onClick: () => {
      if (publicKey == null) {
        openPopup(<Connect />);
        return;
      }
      openForm();
    },
  };
}
