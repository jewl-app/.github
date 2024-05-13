import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { linkAccount } from "@/core/ansi";
import { promptConfirm, promptText } from "@/core/prompt";
import { loadKeyfile } from "@/core/key";

export default async function keypairUtilities(): Promise<void> {
  const keyfileExists = await promptConfirm("Do you already have a keyfile?");
  const keyfile = keyfileExists ? await promptText("What is the keyfile path?") : null;
  const keypair = keyfile == null ? Keypair.generate() : loadKeyfile(keyfile ?? "");
  const secretKey = base58.encode(keypair.secretKey);

  console.info();
  console.info(keyfileExists ? "Used existing keypair" : "Generated a new keypair");
  console.info(`Address:  ${await linkAccount(keypair.publicKey)}`);
  console.info(`Key:      ${secretKey}`);
}
