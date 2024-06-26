import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { PublicKey } from "@solana/web3.js";
import type { ButtonSpec, TreasuryButtonContext } from "@/app/transactions/spec";
import dynamic from "next/dynamic";
import { useFeeConfig } from "@/app/hooks/fee";
import { useWallet } from "@/app/hooks/wallet";
import { usePopup } from "@/app/hooks/popup";
import { createWithdrawFeeInstruction } from "@/core/instruction";
import { useCallback, useMemo } from "react";
import type { FormFieldMeta } from "@/app/form/field";
import { useTransaction } from "@/app/hooks/transaction";
import { shortAddress } from "@/core/address";
import { useTokenMetadata } from "@/app/hooks/meta";
import { useAnalytics } from "@/app/hooks/analytics";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useWithdrawFeesButton(ctx: TreasuryButtonContext): ButtonSpec {
  const { value: tokenAccounts, reload } = ctx;
  const { publicKey } = useWallet();
  const { feeAuthority } = useFeeConfig();
  const { openPopup } = usePopup();
  const { logEvent } = useAnalytics();
  const { sendTransaction } = useTransaction();

  const tokenMap = useMemo(() => {
    return new Map(tokenAccounts?.map(x => [x.mint.toBase58(), x]) ?? []);
  }, [tokenAccounts]);

  const formCompletion = useCallback(async (fields: Array<FormFieldMeta>) => {
    if (publicKey == null) {
      throw new Error("No wallet");
    }
    logEvent("withdraw.completed");
    const tokenMint = fields[0].value as string;
    const amount = fields[1].value as bigint;
    const instruction = createWithdrawFeeInstruction({
      payer: publicKey,
      tokenMint: new PublicKey(tokenMint),
      amount: amount,
    });
    const hash = await sendTransaction([instruction]);
    reload();
    return hash;
  }, [publicKey, sendTransaction, reload, logEvent, tokenMap]);

  const editForm = useCallback(async (fields: Array<FormFieldMeta>) => {
    const tokenMint = fields[0].value as string;
    const maxAmount = tokenMap.get(tokenMint)?.amount ?? 0n;
    const tokenDecimals = tokenMap.get(tokenMint)?.decimals ?? 0;

    const newFields = [...fields];
    newFields[1] = { ...fields[1], max: maxAmount, decimals: tokenDecimals } as FormFieldMeta;

    return Promise.resolve(newFields);
  }, [tokenMap]);

  const { symbol } = useTokenMetadata(tokenAccounts ?? []);

  const openForm = useCallback(() => {
    const options = Object.fromEntries(
      tokenAccounts?.map(x => [
        x.mint.toBase58(),
        `${symbol(x)} (${shortAddress(x.mint)})`,
      ]) ?? [],
    );
    const fields: Array<FormFieldMeta> = [
      { type: "choice", title: "Token", options: options, required: true },
      { type: "bigint", title: "Amount", placeholder: 0n, min: 0n, required: true },
    ];
    logEvent("withdraw.opened");
    openPopup(
      <Form
        title="Withdraw fees"
        subtitle="Withdraw fees from the protocol fee accounts."
        button="Continue"
        fields={fields}
        onChange={editForm}
        onComplete={formCompletion}
      />,
    );
  }, [tokenAccounts, editForm, openPopup, formCompletion, logEvent, symbol, tokenMap]);

  const correctPublicKey = publicKey == null || publicKey.equals(feeAuthority ?? PublicKey.default);
  const correctPublicKeyDisabled = correctPublicKey ? null : "Connect using the fee withdraw authority to withdraw fees.";
  const hasTokenAccounts = tokenMap.size > 0;
  const hasTokenAccountsDisabled = hasTokenAccounts ? null : "No token accounts to withdraw from.";

  return {
    icon: faChevronDown,
    label: "Withdraw",
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
