import { feeConfigAddress } from "@/core/address";
import { linkAccount, linkTransaction } from "@/core/ansi";
import { rpcUrl, signer } from "@/core/env";
import { createInitializeFeeInstruction } from "@/core/instruction";
import { sendAndConfirmTransaction } from "@/core/transaction";
import { Connection } from "@solana/web3.js";

export default async function initializeFeeConfig(): Promise<void> {
  const connection = new Connection(rpcUrl);

  const feeConfigInfo = await connection.getAccountInfo(feeConfigAddress);
  const feeConfigInitialized = feeConfigInfo != null;

  const instructions = [createInitializeFeeInstruction({
    payer: signer.publicKey,
  })];

  const signature = await sendAndConfirmTransaction({
    connection,
    instructions,
    payer: signer.publicKey,
    signTransaction: async tx => {
      tx.sign([signer]);
      return Promise.resolve(tx);
    },
  });

  console.info();
  console.info(`${feeConfigInitialized ? "Updated" : "Initialized"} fee config ${await linkAccount(feeConfigAddress)}`);
  console.info(`Transaction ${await linkTransaction(signature)}`);
}
