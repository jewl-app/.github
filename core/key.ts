import { Keypair } from "@solana/web3.js";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";

export function loadKeyfile(path: string): Keypair {
  const keyfilePath = path.replace("~", homedir());
  if (!existsSync(keyfilePath)) { throw new Error(`Keyfile not found at ${keyfilePath}`); }
  const keyfileBuffer = readFileSync(keyfilePath);
  const decodedKeyfile = JSON.parse(keyfileBuffer.toString()) as Array<number>;
  const keyfileArray = new Uint8Array(decodedKeyfile);
  return Keypair.fromSecretKey(keyfileArray);
}
