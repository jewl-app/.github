import { AuthorityType, ExtensionType, LENGTH_SIZE, TYPE_SIZE, createInitializeMetadataPointerInstruction, createInitializeMintCloseAuthorityInstruction, createInitializeMintInstruction, createSetAuthorityInstruction, getMintLen } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { feeConfigAddress, tokenExtensionsProgramId } from "@/core/address";
import { TokenMetadata, createInitializeInstruction, createUpdateAuthorityInstruction, createUpdateFieldInstruction, pack } from "@solana/spl-token-metadata";

export async function createNftMintInstructions(connection: Connection, mint: Keypair, payer: PublicKey): Promise<Array<TransactionInstruction>> {
  const metadata: TokenMetadata = {
    mint: mint.publicKey,
    updateAuthority: feeConfigAddress,
    name: "jewl allocation",
    symbol: "jewl",
    uri: `https://jewl.app/api/nft/${mint.publicKey}/meta`,
    additionalMetadata: [
      ["description", "Tax-efficient on-chain renumeration."],
      ["link", "https://jewl.app"],
      ["discord", "https://discord.gg/w9DpyG6ddG"],
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
