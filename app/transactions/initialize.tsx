import type { ButtonSpec } from "@/app/transactions/spec";
import dynamic from "next/dynamic";
import { useWallet } from "@/app/hooks/wallet";
import { usePopup } from "@/app/hooks/popup";
import { createInitializeAllocationInstruction } from "@/core/instruction";
import { Keypair, PublicKey } from "@solana/web3.js";
import { useCallback } from "react";
import type { FormFieldMeta } from "@/app/form/field";
import { useTransaction } from "@/app/hooks/transaction";
import { useConnection } from "@/app/hooks/connection";
import { useAnalytics } from "@/app/hooks/analytics";
import { createNftMintInstructions } from "@/core/nft";
import { useAllocations } from "@/app/hooks/allocations";
import { faCubes } from "@fortawesome/free-solid-svg-icons";

const Connect = dynamic(async () => import("@/app/components/connect"));
const Form = dynamic(async () => import("@/app/form"));

export function useInitializeAllocationButton(): Omit<ButtonSpec, "disabled"> {
  const { reload } = useAllocations();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { openPopup } = usePopup();
  const { logEvent } = useAnalytics();
  const { sendTransaction } = useTransaction();

  const formCompletion = useCallback(async (fields: Array<FormFieldMeta>) => {
    if (publicKey == null) {
      throw new Error("No wallet");
    }
    logEvent("initialize.completed");
    const decreaseAuthority = fields[0].value as PublicKey;
    const metadataUri = fields[1].value as string;
    const keypair = Keypair.generate();
    const instructions = await createNftMintInstructions(connection, keypair, publicKey, metadataUri);
    instructions.push(
      createInitializeAllocationInstruction({
        payer: publicKey,
        nftMint: keypair.publicKey,
        authority: decreaseAuthority,
      }),
    );
    const hash = await sendTransaction(instructions, [keypair]);
    reload();
    return hash;
  }, [publicKey, sendTransaction, logEvent, reload, connection]);

  const openForm = useCallback(() => {
    const fields: Array<FormFieldMeta> = [
      { type: "pubkey", title: "Decrease Authority", placeholder: PublicKey.default },
      { type: "info", title: "Metadata", value: "https://arweave.net/nduI5wPV_qtMdQnJvV0XDTDmTdc5VeyxzeiWGAPNDTM" },
    ];
    logEvent("increase.opened");
    openPopup(
      <Form
        title="Initialize allocation"
        subtitle="Initialize a new allocation."
        button="Continue"
        fields={fields}
        onComplete={formCompletion}
      />,
    );
  }, [openPopup, formCompletion, logEvent]);

  return {
    icon: faCubes,
    label: "Create Allocation",
    onClick: () => {
      if (publicKey == null) {
        openPopup(<Connect />);
        return;
      }
      openForm();
    },
  };
}
