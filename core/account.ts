import type { Connection, PublicKey, AccountInfo } from "@solana/web3.js";
import { interval } from "@/core/interval";

const MAX_CHUNK_SIZE = 100;

export async function getMultipleAccountsBatched (connection: Connection, publicKeys: Array<PublicKey>): Promise<Array<AccountInfo<Buffer> | null>> {
  if (publicKeys.length === 0) { return []; }
  const numChunks = Math.ceil(publicKeys.length / MAX_CHUNK_SIZE);
  const chunks = interval(numChunks).map(i => publicKeys.slice(i * MAX_CHUNK_SIZE, (i + 1) * MAX_CHUNK_SIZE));
  const promises = chunks.map(async chunk => connection.getMultipleAccountsInfo(chunk));
  const results = await Promise.all(promises);
  return results.flat();
}
