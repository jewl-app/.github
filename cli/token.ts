import { linkAccount, linkTransaction } from "@/core/ansi";
import { rpcUrl, signer } from "@/core/env";
import { createNftMintInstructions } from "@/core/nft";
import { promptText } from "@/core/prompt";
import { sendAndConfirmTransaction } from "@/core/transaction";
import { Connection, Keypair } from "@solana/web3.js";

export default async function createNonFungibleToken(): Promise<void> {
  const connection = new Connection(rpcUrl);
  const keypair = Keypair.generate();
  const uri = await promptText("What metadata uri?", "https://arweave.net/nduI5wPV_qtMdQnJvV0XDTDmTdc5VeyxzeiWGAPNDTM");

  const instructions = await createNftMintInstructions(connection, keypair, signer.publicKey, uri);

  const signature = await sendAndConfirmTransaction({
    connection,
    instructions,
    payer: signer.publicKey,
    signTransaction: async tx => {
      tx.sign([signer, keypair]);
      return Promise.resolve(tx);
    },
  });

  console.info();
  console.info("Created non-fungible token");
  console.info(`Mint:         ${await linkAccount(keypair.publicKey)}`);
  console.info(`Transaction:  ${await linkTransaction(signature)}`);
}
