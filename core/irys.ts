import { WebIrys } from "@irys/sdk";
import type { PublicKey, Transaction } from "@solana/web3.js";
import { Connection } from "@solana/web3.js";
import { getCluster } from "@/core/cluster";

export interface IrysWalletProvider {
  publicKey: PublicKey;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

export async function getIrys(
  rpcUrl: string,
  provider: IrysWalletProvider,
): Promise<WebIrys> {
  const connection = new Connection(rpcUrl);
  const cluster = await getCluster(connection);
  const network = cluster === "mainnet-beta" ? "mainnet" : "devnet";
  const wallet = { rpcUrl: rpcUrl, name: "solana", provider };
  const irys = new WebIrys({ network, token: "solana", wallet });
  await irys.ready();
  return irys;
}

export async function uploadIrys(
  irys: WebIrys,
  buffer: string | Buffer,
): Promise<string> {
  const balance = await irys.getLoadedBalance();
  const required = await irys.getPrice(buffer.length);
  const fund = required.minus(balance);
  if (fund.gt(0)) {
    await irys.fund(fund);
  }
  const response = await irys.upload(buffer);
  return `https://arweave.net/${response.id}`;
}
