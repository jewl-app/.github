import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { PublicKey } from "@solana/web3.js";
import type { AllocationButtonContext, ButtonSpec } from "@/app/transactions/spec";
import dynamic from "next/dynamic";
import { useWallet } from "@/app/hooks/wallet";
import { usePopup } from "@/app/hooks/popup";
import { useCallback, useMemo } from "react";
import type { Mint } from "@solana/spl-token";
import { createDecreaseAllocationInstruction } from "@/core/instruction";
import type { FormFieldMeta } from "@/app/form/field";
import { useTransaction } from "@/app/hooks/transaction";
import { shortAddress } from "@/core/address";
import { useTokenMetadata } from "../hooks/meta";
import { nonNull } from "@/core/array";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useDecreaseAllocationButton(ctx: AllocationButtonContext): ButtonSpec {
  const { value: allocation, reload } = ctx;
  const { publicKey } = useWallet();
  const { openPopup } = usePopup();
  const { sendTransaction } = useTransaction();

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

  const tokenMints = useMemo(() => [
    allocation?.firstTokenMint,
    allocation?.secondTokenMint,
    allocation?.thirdTokenMint,
  ].filter(nonNull), [tokenMap]);

  const { symbol } = useTokenMetadata(tokenMints);

  const formCompletion = useCallback(async (fields: Array<FormFieldMeta>) => {
    if (publicKey == null || allocation == null) {
      throw new Error("No wallet");
    }
    const tokenMint = fields[0].value as string;
    const amount = fields[1].value as bigint;
    const instruction = createDecreaseAllocationInstruction({
      payer: publicKey,
      nftMint: allocation.address,
      tokenMint: new PublicKey(tokenMint),
      amount,
    });
    const hash = await sendTransaction([instruction]);
    reload();
    return hash;
  }, [publicKey, allocation, sendTransaction, reload]);

  const editForm = useCallback(async (fields: Array<FormFieldMeta>) => {
    const tokenMint = fields[0].value as string;
    const tokenAmount = amountMap.get(tokenMint) ?? 0n;
    const tokenDecimals = tokenMap.get(tokenMint)?.decimals ?? 0;

    const newFields = [...fields];
    newFields[1] = { ...fields[1], max: tokenAmount, decimals: tokenDecimals } as FormFieldMeta;

    return Promise.resolve(newFields);
  }, [amountMap]);

  const openForm = useCallback(() => {
    const options = Object.fromEntries(
      Array.from(tokenMap.entries()).map(([key]) => [
        key,
        `${symbol(key)} (${shortAddress(key)})`,
      ]),
    );
    const fields: Array<FormFieldMeta> = [
      { type: "choice", title: "Token", options: options, required: true },
      { type: "bigint", title: "Amount", placeholder: 0n, min: 0n, required: true },
    ];
    openPopup(
      <Form
        title="Decrease allocation"
        subtitle="Remove tokens from the allocation."
        button="Continue"
        fields={fields}
        onChange={editForm}
        onComplete={formCompletion}
      />,
    );
  }, [tokenMap, openPopup, editForm, formCompletion]);


  const correctPublicKey = publicKey == null || publicKey.equals(allocation?.decreaseAuthority ?? PublicKey.default);
  const correctPublicKeyDisabled = correctPublicKey ? null : "Connect using the decrease authority of this allocation to decrease the allocation.";
  const hasTokenAccounts = tokenMap.size > 0;
  const hasTokenAccountsDisabled = hasTokenAccounts ? null : "No token accounts available to decrease the allocation.";

  return {
    icon: faMinus,
    label: "Decrease",
    disabled: correctPublicKeyDisabled ?? hasTokenAccountsDisabled ?? false,
    onClick: () => {
      if (publicKey == null) {
        openPopup(<Connect />);
        return;
      }
      openForm();
    },
  };
}
