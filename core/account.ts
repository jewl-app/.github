import type { Connection, AccountInfo } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { interval } from "@/core/interval";

const MAX_CHUNK_SIZE = 100;

export async function getAccountsBatched(connection: Connection, publicKeys: Array<PublicKey>): Promise<Array<AccountInfo<Buffer> | null>> {
  if (publicKeys.length === 0) { return []; }
  const resultsMap = new Map<string, AccountInfo<Buffer> | null>(publicKeys.map(key => [key.toBase58(), null]));
  const numChunks = Math.ceil(resultsMap.size / MAX_CHUNK_SIZE);
  const chunks = interval(numChunks)
    .map(i => Array.from(resultsMap.keys())
      .slice(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE));
  for (const chunk of chunks) {
    const keys = chunk.map(key => new PublicKey(key));
    const chunkResults = await connection.getMultipleAccountsInfo(keys);
    chunkResults.forEach((info, i) => {
      resultsMap.set(chunk[i], info);
    });
  }
  const results: Array<AccountInfo<Buffer> | null> = [];
  for (const key of publicKeys) {
    results.push(
      resultsMap.get(key.toBase58()) ?? null,
    );
  }
  return results;
}
