import type { Connection, AccountInfo } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { interval, nonNull } from "@/core/array";

const MAX_CHUNK_SIZE = 100;

export async function getAccountsBatched(connection: Connection, publicKeys: Array<PublicKey | null>): Promise<Array<AccountInfo<Buffer> | null>> {
  if (publicKeys.length === 0) { return []; }
  const nonNullKeys = publicKeys.filter(nonNull).map(key => key.toBase58());
  const resultsMap = new Map<string, AccountInfo<Buffer> | null>(nonNullKeys.map(key => [key, null]));
  const numChunks = Math.ceil(resultsMap.size / MAX_CHUNK_SIZE);
  const chunks = interval(numChunks).map(i => nonNullKeys.slice(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE));
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
      resultsMap.get(key?.toBase58() ?? "") ?? null,
    );
  }
  return results;
}
