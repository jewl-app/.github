import type { Choice } from "@/core/prompt";
import { promptChoice } from "@/core/prompt";

type Handler = () => Promise<void>;

function handler(file: string): Handler {
  return async () => {
    const command = await import(file) as { default: Handler };
    await command.default();
  };
}

const commands: Array<Choice<Handler>> = [
  { title: "deploy", description: "Deploy Solana program", value: handler("@/cli/deploy") },
  { title: "initialize", description: "Initialize/update the jewl fee config", value: handler("@/cli/initialize") },
  { title: "upload", description: "Upload nft metadata to arweave", value: handler("@/cli/upload") },
  { title: "token", description: "Create a new jewl non-fungible token", value: handler("@/cli/token") },
  { title: "keypair", description: "Generate a new keypair in base58", value: handler("@/cli/keypair") },
  { title: "address", description: "Get account data at address", value: handler("@/cli/address") },
  { title: "signature", description: "Get transaction data at signature", value: handler("@/cli/signature") },
];

promptChoice("Select an instruction to execute", commands)
  .then(async command => command())
  .catch(console.error);
