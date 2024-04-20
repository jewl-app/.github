import type { Connection } from "@solana/web3.js";

const clusters = new Map<string, string>();

const genesisMap = new Map([
  ["EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG", "devnet"],
  ["4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY", "testnet"],
  ["5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d", "mainnet-beta"],
]);

export async function getCluster(connection: Connection): Promise<string> {
  const cachedCluster = clusters.get(connection.rpcEndpoint);
  if (cachedCluster != null) { return cachedCluster; }
  const genesisHash = await connection.getGenesisHash();

  const cluster = genesisMap.get(genesisHash) ?? "localnet";
  clusters.set(connection.rpcEndpoint, cluster);
  return cluster;
}
