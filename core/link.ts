import { Connection, type PublicKey } from "@solana/web3.js";
import { getCluster } from "@/core/cluster";
import { rpcUrl } from "@/core/env";

const connection = new Connection(rpcUrl);

async function clusterQuery(): Promise<string> {
  const cluster = await getCluster(connection);
  if (cluster === "mainnet-beta") { return ""; }
  return `?cluster=${cluster}`;
}

export async function transactionUrl(hash: string): Promise<string> {
  const cluster = await clusterQuery();
  return `https://solscan.io/tx/${hash}${cluster}`;
}

export async function accountUrl(key: PublicKey): Promise<string> {
  const cluster = await clusterQuery();
  return `https://solscan.io/address/${key.toBase58()}${cluster}`;
}
