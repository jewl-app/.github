import type { TransactionInstruction } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useWallet } from "@/app/hooks/wallet";
import { useConnection } from "@/app/hooks/connection";
import type { TransactionStep } from "@/core/transaction";
import { sendAndConfirmTransaction } from "@/core/transaction";

export interface TransactionState {
  step: TransactionStep | "ready";
  expiry: number;
}

export interface UseTransaction {
  readonly state: TransactionState;
  sendTransaction: (instructions: Array<TransactionInstruction>) => Promise<string | null>;
}

export const TransactionContext = createContext<UseTransaction>({
  state: { step: "ready", expiry: 0 },
  sendTransaction: async () => Promise.reject(new Error("No provider")),
});

export function useTransaction(): UseTransaction {
  return useContext(TransactionContext);
}

export default function TransactionProvider(props: PropsWithChildren): ReactElement {
  const { connection } = useConnection();
  const { wallet, account } = useWallet();
  const [transactionState, setTransactionState] = useState<TransactionState>({ step: "ready", expiry: 0 });

  const sendTransaction = useCallback(async (instructions: Array<TransactionInstruction>) => {
    if (wallet == null) { return null; }
    if (account == null) { return null; }
    try {
      return await sendAndConfirmTransaction({
        connection,
        instructions,
        payer: new PublicKey(account.publicKey),
        signTransaction: async (transaction: VersionedTransaction) => {
          const [{ signedTransaction }] = await wallet.features["solana:signTransaction"].signTransaction({
            transaction: transaction.serialize(),
            account,
          });
          return VersionedTransaction.deserialize(signedTransaction);
        },
        progress: (step, expiry) => { setTransactionState({ step, expiry }); },
      });
    } finally {
      setTransactionState({ step: "ready", expiry: 0 });
    }
  }, [connection, wallet, account, setTransactionState]);

  const context = useMemo(() => ({
    state: transactionState,
    sendTransaction,
  }), [transactionState, sendTransaction]);

  return <TransactionContext.Provider value={context}>{props.children}</TransactionContext.Provider>;
}
