import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { AllocationButtonContext, ButtonContext, ButtonSpec } from "@/app/transactions/spec";
import dynamic from "next/dynamic";
import { useWallet } from "@/app/hooks/wallet";
import { usePopup } from "@/app/hooks/popup";
import { createDecreaseAllocationInstruction } from "@/core/instruction";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useMemo } from "react";
import type { FormFieldMeta } from "@/app/form/field";
import { useTransaction } from "@/app/hooks/transaction";
import { useFeeConfig } from "@/app/hooks/fee";
import { useInterval } from "@/app/hooks/interval";
import { getFungibleTokenAccountsForOwner } from "@/core/token";
import { useConnection } from "@/app/hooks/connection";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useIncreaseAllocationButton(ctx: ButtonContext): ButtonSpec {
  const { value: allocation, reload } = ctx as AllocationButtonContext;
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { openPopup } = usePopup();
  const { feeBps } = useFeeConfig();
  const { sendTransaction } = useTransaction();

  const allocationTokens = useMemo(() => {
    return new Set([
      allocation?.firstTokenMint.toBase58(),
      allocation?.secondTokenMint.toBase58(),
      allocation?.thirdTokenMint.toBase58(),
    ].flatMap(x => (x == null ? [] : [x])));
  }, [allocation]);

  const { result: tokenAccounts } = useInterval({
    interval: 1000 * 30, // 30 seconds
    callback: async () => {
      if (publicKey == null) {
        return [];
      }
      return getFungibleTokenAccountsForOwner(connection, publicKey);
    },
  }, [publicKey, connection]);

  const selectableTokens = useMemo(() => {
    if (allocationTokens.size === 3) {
      return tokenAccounts?.filter(x => allocationTokens.has(x.mint.toBase58())) ?? [];
    }
    return tokenAccounts ?? [];
  }, [tokenAccounts, allocationTokens]);

  const tokenMap = useMemo(() => {
    return new Map(selectableTokens.map(x => [x.mint.toBase58(), x]));
  }, [selectableTokens]);

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
    const inputAmount = fields[1].value as number;
    // TODO: \/ decimals
    const tokenAmount = Number(tokenMap.get(tokenMint)?.amount ?? 0n);
    // TODO: symbol
    const displayFeeAmount = (inputAmount * feeBps / 10000).toFixed(2);

    const newFields = [...fields];
    newFields[1] = { ...fields[1], max: tokenAmount } as FormFieldMeta;
    newFields[2] = { ...fields[2], value: displayFeeAmount } as FormFieldMeta;

    return Promise.resolve(newFields);
  }, [tokenMap, feeBps]);

  const openForm = useCallback(() => {
    // TODO: \/ token meta name and symbol suffixes
    const options = Array.from(tokenMap.keys());
    const fields: Array<FormFieldMeta> = [
      { type: "choice", title: "Token", options: options, required: true },
      { type: "number", title: "Amount", placeholder: 0, min: 0, required: true },
      { type: "info", title: "Fee", value: "0" },
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

  return {
    icon: faPlus,
    label: "Increase",
    enabled: true,
    onClick: () => {
      if (publicKey == null) {
        openPopup(<Connect />);
        return;
      }
      openForm();
    },
  };
}
