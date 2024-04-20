import { linkAccount, linkTransaction } from "@/core/ansi";
import { rpcUrl, signer } from "@/core/env";
import { createNftMintInstructions } from "@/core/nft";
import { sendAndConfirmTransaction } from "@/core/transaction";
import { Connection, Keypair } from "@solana/web3.js";

export default async function createNonFungibleToken(): Promise<void> {
  const connection = new Connection(rpcUrl);
  const keypair = Keypair.generate();

  const instructions = await createNftMintInstructions(connection, keypair, signer.publicKey);

  const signature = await sendAndConfirmTransaction({
    connection,
    instructions,
    payer: signer.publicKey,
    signTransaction: async tx => {
      tx.sign([signer, keypair]);
      return tx;
    },
  });

  console.info();
  console.info(`Mint ${await linkAccount(keypair.publicKey)}`);
  console.info(`Transaction ${await linkTransaction(signature)}`);
}
