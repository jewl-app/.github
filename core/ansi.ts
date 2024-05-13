import type { PublicKey } from "@solana/web3.js";
import { transactionUrl, accountUrl } from "@/core/link";
import { shortAddress } from "@/core/address";

export function link(url: string, str?: string): string {
  const content = str ?? url;
  return `\u{1b}]8;;${url}\u{7}${content}\u{1b}]8;;\u{7}`;
}

export async function linkTransaction(hash: string, text?: string): Promise<string> {
  const url = await transactionUrl(hash);
  const content = text ?? shortAddress(hash);
  return link(url, content);
}

export async function linkAccount(key: PublicKey, text?: string): Promise<string> {
  const url = await accountUrl(key);
  const content = text ?? shortAddress(key);
  return link(url, content);
}
