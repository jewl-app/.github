import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { PublicKey } from "@solana/web3.js";
import type { AllocationButtonContext, ButtonContext, ButtonSpec } from "@/app/transactions/spec";
import dynamic from "next/dynamic";
import { useWallet } from "@/app/hooks/wallet";
import { usePopup } from "@/app/hooks/popup";
import { useCallback, useMemo } from "react";
import type { Mint } from "@solana/spl-token";
import { createDecreaseAllocationInstruction } from "@/core/instruction";
import type { FormFieldMeta } from "@/app/form/field";
import { useTransaction } from "@/app/hooks/transaction";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useDecreaseAllocationButton(ctx: ButtonContext): ButtonSpec {
  const { value: allocation, reload } = ctx as AllocationButtonContext;
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

  const formCompletion = useCallback(async (fields: Array<FormFieldMeta>) => {
    if (publicKey == null || allocation == null) {
      throw new Error("No wallet");
    }
    const tokenMint = fields[0].value as string;
    const amount = fields[1].value as number;
    const instruction = createDecreaseAllocationInstruction({
      payer: publicKey,
      nftMint: allocation.address,
      tokenMint: new PublicKey(tokenMint),
      amount: BigInt(amount), // TODO: <- decimals
    });
    const hash = await sendTransaction([instruction]);
    reload();
    return hash;
  }, [publicKey, allocation, sendTransaction, reload]);

  const editForm = useCallback(async (fields: Array<FormFieldMeta>) => {
    const tokenMint = fields[0].value as string;
    // TODO: \/ decimals
    const tokenAmount = Number(amountMap.get(tokenMint) ?? 0n);
    const newFields = [...fields];
    newFields[1] = { ...fields[1], max: tokenAmount } as FormFieldMeta;

    return Promise.resolve(newFields);
  }, [amountMap]);

  const openForm = useCallback(() => {
    // TODO: \/ token meta name and symbol suffix
    const options = Array.from(tokenMap.keys());
    const fields: Array<FormFieldMeta> = [
      { type: "choice", title: "Token", options: options, required: true },
      { type: "number", title: "Amount", placeholder: 0, min: 0, required: true },
    ];
    openPopup(
      <Form
        title="Decrease allocation"
        button="Continue"
        fields={fields}
        onChange={editForm}
        onComplete={formCompletion}
      />,
    );
  }, [tokenMap, openPopup, editForm, formCompletion]);


  const correctPublicKey = publicKey == null || publicKey.equals(allocation?.decreaseAuthority ?? PublicKey.default);
  const hasTokenAccounts = tokenMap.size > 0;

  return {
    icon: faMinus,
    label: "Decrease",
    enabled: correctPublicKey && hasTokenAccounts,
    onClick: () => {
      if (publicKey == null) {
        openPopup(<Connect />);
        return;
      }
      openForm();
    },
  };
}
