import { linkAccount } from "@/core/ansi";
import { rpcUrl } from "@/core/env";
import { promptText } from "@/core/prompt";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export default async function getAccountData(): Promise<void> {
  const connection = new Connection(rpcUrl);
  const retrieveAddress = await promptText("What is the address that you want to retrieve?");
  const address = new PublicKey(retrieveAddress);

  const accountInfo = await connection.getAccountInfo(address);

  console.info();

  if (accountInfo == null) {
    console.info(`Account ${retrieveAddress} not found`);
    return;
  }

  const balance = accountInfo.lamports / LAMPORTS_PER_SOL;
  const balanceSuffix = balance > 0 && balance < 0.005 ? "+" : "";

  console.info(`Account ${await linkAccount(address)}`);
  console.info(`Owner: ${await linkAccount(accountInfo.owner)}`);
  console.info(`Balance: ◎${balance.toFixed(2)}${balanceSuffix}`);
  console.info(`Data: ${new Uint8Array(accountInfo.data)}`);
}
