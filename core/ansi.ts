import type { PublicKey } from "@solana/web3.js";
import { transactionUrl, accountUrl } from "@/core/link";

export function link(str: string, url: string): string {
  return `\u{1b}]8;;${url}\u{7}${str}\u{1b}]8;;\u{7}`;
}

export async function linkTransaction(hash: string, text?: string): Promise<string> {
  const url = await transactionUrl(hash);
  const content = text ?? hash;
  return link(content, url);
}

export async function linkAccount(key: PublicKey, text?: string): Promise<string> {
  const url = await accountUrl(key);
  const content = text ?? key.toBase58();
  return link(content, url);
}
