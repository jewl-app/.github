import { faCogs } from "@fortawesome/free-solid-svg-icons";
import { PublicKey } from "@solana/web3.js";
import type { ButtonSpec, TreasuryButtonContext } from "@/app/transactions/spec";
import dynamic from "next/dynamic";
import { useFeeConfig } from "@/app/hooks/fee";
import { useWallet } from "@/app/hooks/wallet";
import { usePopup } from "@/app/hooks/popup";
import { useCallback } from "react";
import type { FormFieldMeta } from "../form/field";
import { shortAddress } from "@/core/address";
import { createInitializeFeeInstruction } from "@/core/instruction";
import { useTransaction } from "@/app/hooks/transaction";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useConfigureFeesButton(_ctx: TreasuryButtonContext): ButtonSpec {
  const { publicKey } = useWallet();
  const { feeAuthority, feeWithdrawAuthority, feeBps } = useFeeConfig();
  const { openPopup } = usePopup();
  const { sendTransaction } = useTransaction();
  const { reload } = useFeeConfig();

  const formCompletion = useCallback(async (fields: Array<FormFieldMeta>) => {
    if (publicKey == null) {
      throw new Error("No wallet");
    }
    const newWithdrawAuthority = fields[1].value as PublicKey;
    const newFeeBps = fields[2].value as number;
    const instruction = createInitializeFeeInstruction({
      payer: publicKey,
      feeWithdrawAuthority: newWithdrawAuthority,
      feeBps: newFeeBps,
    });
    const hash = await sendTransaction([instruction]);
    reload();
    return hash;
  }, [publicKey, sendTransaction, reload]);

  const openForm = useCallback(() => {
    const fields: Array<FormFieldMeta> = [
      { type: "info", title: "Fee Authority", value: shortAddress(feeAuthority ?? PublicKey.default) },
      { type: "pubkey", title: "Fee Withdraw Authority", value: feeWithdrawAuthority ?? undefined, placeholder: PublicKey.default, required: true },
      { type: "number", title: "Fee Basis Points", value: feeBps, placeholder: 100, min: 0, max: 10000, suffix: "bps", required: true },
    ];
    openPopup(
      <Form
        title="Configure fees"
        subtitle="Update the fee configuration for the jewl program."
        button="Save"
        fields={fields}
        onComplete={formCompletion}
      />,
    );
  }, [feeAuthority, feeWithdrawAuthority, feeBps, openPopup, formCompletion]);

  const enabled = publicKey == null || publicKey.equals(feeAuthority ?? PublicKey.default);

  return {
    icon: faCogs,
    label: "Configure",
    disabled: enabled ? false : "Connect using the fee authority to configure fees.",
    onClick: () => {
      if (publicKey == null) {
        openPopup(<Connect />);
        return;
      }
      openForm();
    },
  };
}
