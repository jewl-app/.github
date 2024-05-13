import { rpcUrl, signer } from "@/core/env";
import { Connection, sendAndConfirmTransaction } from "@solana/web3.js";
import type { IrysWalletProvider } from "@/core/irys";
import { getIrys, uploadIrys } from "@/core/irys";
import { promptText } from "@/core/prompt";
import { homedir } from "os";
import { readFileSync } from "fs";
import { link } from "@/core/ansi";
import { sign } from "tweetnacl";

export default async function uploadNftMetadata(): Promise<void> {
  const connection = new Connection(rpcUrl);
  const symbol = await promptText("What is the token symbol?", "jewl allocation");
  const name = await promptText("What is the token name?", "jewl");
  const description = await promptText("What is the token description?", "Tax-efficient on-chain renumeration.");
  const imagePath = await promptText("What is the token image?", "~/Downloads/jewl.png");

  const provider: IrysWalletProvider = {
    publicKey: signer.publicKey,
    sendTransaction: async tx => {
      return sendAndConfirmTransaction(connection, tx, [signer]);
    },
    signMessage: async message => {
      return Promise.resolve(
        sign.detached(message, signer.secretKey),
      );
    },
  };
  const irys = await getIrys(rpcUrl, provider);

  const imageUri = imagePath.replace("~", homedir);
  const imageBuffer = readFileSync(imageUri);
  const image = await uploadIrys(irys, imageBuffer);

  const metadataBuffer = JSON.stringify({
    name,
    symbol,
    description,
    image,
    external_url: "https://jewl.app/",
  });
  const metadata = await uploadIrys(irys, metadataBuffer);

  console.info();
  console.info("Uploaded NFT metadata");
  console.info(`Image:     ${link(image)}`);
  console.info(`Metadata:  ${link(metadata)}`);
}
