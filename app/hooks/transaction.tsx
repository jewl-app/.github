import type { Signer, TransactionInstruction } from "@solana/web3.js";
import { VersionedTransaction } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useWallet } from "@/app/hooks/wallet";
import { useConnection } from "@/app/hooks/connection";
import type { TransactionStep } from "@/core/transaction";
import { sendAndConfirmTransaction } from "@/core/transaction";
import { useAnalytics } from "@/app/hooks/analytics";

export interface TransactionState {
  step: TransactionStep | "ready";
  expiry: number;
}

export interface UseTransaction {
  readonly state: TransactionState;
  sendTransaction: (instructions: Array<TransactionInstruction>, signers?: Array<Signer>) => Promise<string | null>;
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
  const { logEvent } = useAnalytics();
  const [transactionState, setTransactionState] = useState<TransactionState>({ step: "ready", expiry: 0 });

  const sendTransaction = useCallback(async (instructions: Array<TransactionInstruction>, signers: Array<Signer> = []) => {
    if (wallet == null) { return null; }
    if (account == null) { return null; }
    try {
      logEvent("transaction.initiated");
      const hash = await sendAndConfirmTransaction({
        connection,
        instructions,
        payer: new PublicKey(account.publicKey),
        signTransaction: async (transaction: VersionedTransaction) => {
          transaction.sign(signers);
          const [{ signedTransaction }] = await wallet.features["solana:signTransaction"].signTransaction({
            transaction: transaction.serialize(),
            account,
          });
          return VersionedTransaction.deserialize(signedTransaction);
        },
        progress: (step, expiry) => { setTransactionState({ step, expiry }); },
      });
      logEvent("transaction.completed");
      return hash;
    } catch (error) {
      if (`${error}`.includes("User rejected the request")) {
        logEvent("transaction.aborted");
      } else {
        logEvent("transaction.failed");
      }
      throw error;
    } finally {
      setTransactionState({ step: "ready", expiry: 0 });
    }
  }, [connection, wallet, account, setTransactionState, logEvent]);

  const context = useMemo(() => ({
    state: transactionState,
    sendTransaction,
  }), [transactionState, sendTransaction]);

  return <TransactionContext.Provider value={context}>{props.children}</TransactionContext.Provider>;
}
