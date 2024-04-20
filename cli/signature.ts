import { rpcUrl } from "@/core/env";
import { promptText } from "@/core/prompt";
import { Connection } from "@solana/web3.js";

export default async function getSignatureData(): Promise<void> {
  const connection = new Connection(rpcUrl);
  const signature = await promptText("What is the signature that you want to retrieve?");

  const transaction = await connection.getParsedTransaction(signature, { maxSupportedTransactionVersion: 0 });

  console.info();

  if (transaction == null) {
    console.info(`Transaction ${signature} not found`);
    return;
  }

  console.info(`Tx: ${signature}`);
  console.info(`Block: ${transaction.slot}`);
  console.info(`Time: ${transaction.blockTime}`);
  transaction.meta?.logMessages?.forEach(log => console.info(log));
}
