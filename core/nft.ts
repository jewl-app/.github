import { AuthorityType, ExtensionType, LENGTH_SIZE, TYPE_SIZE, createInitializeMetadataPointerInstruction, createInitializeMintCloseAuthorityInstruction, createInitializeMintInstruction, createSetAuthorityInstruction, getMintLen } from "@solana/spl-token";
import type { Connection, Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { feeConfigAddress, tokenExtensionsProgramId } from "@/core/address";
import type { TokenMetadata } from "@solana/spl-token-metadata";
import { createInitializeInstruction, createUpdateAuthorityInstruction, createUpdateFieldInstruction, pack } from "@solana/spl-token-metadata";

export async function createNftMintInstructions(connection: Connection, mint: Keypair, payer: PublicKey, uri: string): Promise<Array<TransactionInstruction>> {
  const response = await fetch(uri)
    .then(async x => await x.json() as unknown)
    .then(assertValidMetadata);

  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    updateAuthority: feeConfigAddress,
    name: response.name,
    symbol: response.symbol,
    uri,
    additionalMetadata: [
      ["description", response.description],
      ["link", response.external_url],
      ["discord", "https://discord.gg/w9DpyG6ddG"],
      ["twitter", "https://twitter.com/jewl_app"],
    ],
  };

  const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
  const metadataSize = pack(metadata).length;
  const mintSize = getMintLen([ExtensionType.MintCloseAuthority, ExtensionType.MetadataPointer]);
  const minRent = await connection.getMinimumBalanceForRentExemption(mintSize + metadataExtension + metadataSize);

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: mint.publicKey,
    space: mintSize,
    lamports: minRent,
    programId: tokenExtensionsProgramId,
  });

  const initializeMintCloseAuthorityInstruction = createInitializeMintCloseAuthorityInstruction(
    mint.publicKey,
    feeConfigAddress,
    tokenExtensionsProgramId,
  );

  const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
    mint.publicKey,
    null,
    mint.publicKey,
    tokenExtensionsProgramId,
  );

  const initializeMintInstruction = createInitializeMintInstruction(
    mint.publicKey,
    0,
    payer,
    null,
    tokenExtensionsProgramId,
  );

  const initializeMetadataInstruction = createInitializeInstruction({
    programId: tokenExtensionsProgramId,
    metadata: mint.publicKey,
    updateAuthority: payer,
    mint: mint.publicKey,
    mintAuthority: payer,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
  });

  const updateFieldInstructions = metadata.additionalMetadata.map(([field, value]) => createUpdateFieldInstruction({
    programId: tokenExtensionsProgramId,
    metadata: mint.publicKey,
    updateAuthority: payer,
    field,
    value,
  }));

  const renounceMetadataUpdateAuthority = createUpdateAuthorityInstruction({
    metadata: mint.publicKey,
    oldAuthority: payer,
    newAuthority: null,
    programId: tokenExtensionsProgramId,
  });

  const setMintAuthorityInstruction = createSetAuthorityInstruction(
    mint.publicKey,
    payer,
    AuthorityType.MintTokens,
    feeConfigAddress,
    [],
    tokenExtensionsProgramId,
  );

  return [
    createAccountInstruction,
    initializeMintCloseAuthorityInstruction,
    initializeMetadataPointerInstruction,
    initializeMintInstruction,
    initializeMetadataInstruction,
    ...updateFieldInstructions,
    renounceMetadataUpdateAuthority,
    setMintAuthorityInstruction,
  ];
}

export interface NftMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
}

function assertValidMetadata(metadata: unknown): NftMetadata {
  if (typeof metadata !== "object" || metadata === null) {
    throw new Error("Invalid metadata");
  }
  if (!("name" in metadata) || typeof metadata.name !== "string" || metadata.name.length === 0) {
    throw new Error("Invalid or missing name");
  }
  if (!("symbol" in metadata) || typeof metadata.symbol !== "string" || metadata.symbol.length === 0) {
    throw new Error("Invalid or missing symbol");
  }
  if (!("description" in metadata) || typeof metadata.description !== "string" || metadata.description.length === 0) {
    throw new Error("Invalid or missing description");
  }
  if (!("image" in metadata) || typeof metadata.image !== "string" || metadata.image.length === 0) {
    throw new Error("Invalid or missing image");
  }
  if (!("external_url" in metadata) || typeof metadata.external_url !== "string" || metadata.external_url !== "https://jewl.app/") {
    throw new Error("Invalid or missing external_url");
  }
  return metadata as NftMetadata;
}
