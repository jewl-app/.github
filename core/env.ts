import { resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import YAML from "yaml";
import base58 from "bs58";
import type { Signer } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";

export let rpcUrl = process.env.RPC_URL ?? "https://api.devnet.solana.com";
let solanaWallet = process.env.SOLANA_WALLET ?? base58.encode(Keypair.generate().secretKey);

const environment = process.env.VERCEL_ENV ?? "development";

const solanaConfigFile = resolve(homedir(), ".config", "solana", "cli", "config.yml");
if (existsSync(solanaConfigFile) && environment === "development") {
  const configYml = readFileSync(solanaConfigFile, { encoding: "utf8" });
  const config = YAML.parse(configYml) as { json_rpc_url: string, keypair_path: string };
  rpcUrl = config.json_rpc_url;

  const signerKeyString = readFileSync(config.keypair_path, { encoding: "utf8" });
  const signerKeyJSON = JSON.parse(signerKeyString) as Array<number>;
  const signerKeyArr = Uint8Array.from(signerKeyJSON);
  solanaWallet = base58.encode(signerKeyArr);
}

const seed = base58.decode(solanaWallet).subarray(0, 32);
export const signer = Keypair.fromSeed(seed) as Signer;

