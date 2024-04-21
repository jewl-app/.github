import { jewlProgramId } from "@/core/address";
import { linkAccount } from "@/core/ansi";
import { getCluster } from "@/core/cluster";
import { rpcUrl } from "@/core/env";
import { execute } from "@/core/execute";
import { promptText } from "@/core/prompt";
import { Connection, PublicKey } from "@solana/web3.js";

export default async function deploySolanaProgram(): Promise<void> {
  const connection = new Connection(rpcUrl);
  const cluster = await getCluster(connection);

  await execute("anchor", "build");

  const programInfo = await connection.getAccountInfo(jewlProgramId);
  const programDeployed = programInfo != null && programInfo.executable;

  if (programDeployed) {
    await execute("anchor", "upgrade", "target/deploy/jewl.so", "--program-id", jewlProgramId.toBase58(), "--provider.cluster", cluster);
  } else {
    const keyfile = await promptText("What is the keyfile for the jewl program?");
    await execute("anchor", "deploy", "--program-keypair", `"${keyfile}"`, "--program-name", "jewl", "--provider.cluster", cluster);
  }

  const idlOwner = PublicKey.findProgramAddressSync([], jewlProgramId)[0];
  const idlAccount = await PublicKey.createWithSeed(idlOwner, "anchor:idl", jewlProgramId);
  const idlInfo = await connection.getAccountInfo(idlAccount);
  const idlInitialized = idlInfo != null && idlInfo.owner.equals(jewlProgramId);

  if (idlInitialized) {
    await execute("anchor", "idl", "upgrade", jewlProgramId.toBase58(), "--filepath", "target/idl/jewl.json", "--provider.cluster", cluster);
  } else {
    await execute("anchor", "idl", "init", jewlProgramId.toBase58(), "--filepath", "target/idl/jewl.json", "--provider.cluster", cluster);
  }

  console.info("");
  console.info(`Deployed program to ${await linkAccount(jewlProgramId)}`);
  console.info(`Deployed IDL to ${await linkAccount(idlAccount)}`);
}
