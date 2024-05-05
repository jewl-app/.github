import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { PublicKey } from "@solana/web3.js";
import type { ButtonContext, ButtonSpec, TreasuryButtonContext } from "@/app/transactions/spec";
import dynamic from "next/dynamic";
import { useFeeConfig } from "@/app/hooks/fee";
import { useWallet } from "@/app/hooks/wallet";
import { usePopup } from "@/app/hooks/popup";
import { createWithdrawFeeInstruction } from "@/core/instruction";
import { useCallback, useMemo } from "react";
import type { FormFieldMeta } from "@/app/form/field";
import { useTransaction } from "@/app/hooks/transaction";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useWithdrawFeesButton(ctx: ButtonContext): ButtonSpec {
  const { value: tokenAccounts, reload } = ctx as TreasuryButtonContext;
  const { publicKey } = useWallet();
  const { feeAuthority } = useFeeConfig();
  const { openPopup } = usePopup();
  const { sendTransaction } = useTransaction();

  const tokenMap = useMemo(() => {
    return new Map(tokenAccounts?.map(x => [x.mint.toBase58(), x]) ?? []);
  }, [tokenAccounts]);

  const formCompletion = useCallback(async (fields: Array<FormFieldMeta>) => {
    if (publicKey == null) {
      throw new Error("No wallet");
    }
    const tokenMint = fields[0].value as string;
    const amount = fields[1].value as number;
    const instruction = createWithdrawFeeInstruction({
      payer: publicKey,
      tokenMint: new PublicKey(tokenMint),
      amount: BigInt(amount), // TODO: <- decimals
    });
    const hash = await sendTransaction([instruction]);
    reload();
    return hash;
  }, [publicKey, sendTransaction, reload]);

  const editForm = useCallback(async (fields: Array<FormFieldMeta>) => {
    const tokenMint = fields[0].value as string;
    const tokenAccount = tokenMap.get(tokenMint);
    // TODO: \/ decimals
    const maxAmount = Number(tokenAccount?.amount ?? 0n);
    const newFields = [...fields];
    newFields[1] = { ...fields[1], max: maxAmount } as FormFieldMeta;

    return Promise.resolve(newFields);
  }, [tokenMap]);

  const openForm = useCallback(() => {
    // TODO: \/ token meta name and symbol suffix
    const options = tokenAccounts?.map(x => x.mint.toBase58()) ?? [];
    const fields: Array<FormFieldMeta> = [
      { type: "choice", title: "Token", options: options, required: true },
      { type: "number", title: "Amount", placeholder: 0, min: 0, required: true },
    ];
    openPopup(
      <Form
        title="Withdraw fees"
        button="Continue"
        fields={fields}
        onChange={editForm}
        onComplete={formCompletion}
      />,
    );
  }, [tokenAccounts, editForm, openPopup, formCompletion]);

  const correctPublicKey = publicKey == null || publicKey.equals(feeAuthority ?? PublicKey.default);
  const hasTokenAccounts = tokenMap.size > 0;

  return {
    icon: faChevronDown,
    label: "Withdraw",
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
