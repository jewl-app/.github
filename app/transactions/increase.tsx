import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { AllocationButtonContext, ButtonSpec } from "@/app/transactions/spec";
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
import { nonNull } from "@/core/array";
import { useTokenMetadata } from "@/app/hooks/meta";
import { shortAddress } from "@/core/address";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useIncreaseAllocationButton(ctx: AllocationButtonContext): ButtonSpec {
  const { value: allocation, reload } = ctx;
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
    ].filter(nonNull));
  }, [allocation]);

  const { result: tokenAccounts } = useInterval({
    interval: 30, // 30 seconds
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

  const { symbol } = useTokenMetadata(selectableTokens);

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
      amount: amount,
    });
    const hash = await sendTransaction([instruction]);
    reload();
    return hash;
  }, [publicKey, allocation, sendTransaction, reload]);

  const editForm = useCallback(async (fields: Array<FormFieldMeta>) => {
    const tokenMint = fields[0].value as string;
    const inputAmount = fields[1].value as number;
    const tokenAmount = tokenMap.get(tokenMint)?.amount ?? 0n;
    const tokenDecimals = tokenMap.get(tokenMint)?.decimals ?? 0;
    const tokenSymbol = symbol(tokenMint) ?? "";
    const displayFeeAmount = (inputAmount * feeBps / 10000).toFixed(2);

    const newFields = [...fields];
    newFields[1] = { ...fields[1], max: tokenAmount, decimals: tokenDecimals, suffix: tokenSymbol } as FormFieldMeta;
    newFields[2] = { ...fields[2], value: displayFeeAmount } as FormFieldMeta;

    return Promise.resolve(newFields);
  }, [tokenMap, feeBps]);

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
      { type: "info", title: "Fee", value: "0" },
    ];
    openPopup(
      <Form
        title="Increase allocation"
        subtitle="Increase or add tokens to the allocation."
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
    onClick: () => {
      if (publicKey == null) {
        openPopup(<Connect />);
        return;
      }
      openForm();
    },
  };
}
