import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID as associatedTokenProgramId } from "@solana/spl-token";
import { TOKEN_PROGRAM_ID as tokenProgramId, TOKEN_2022_PROGRAM_ID as tokenExtensionsProgramId } from "@solana/spl-token";
import idl from "@/target/idl/jewl.json";

export { tokenExtensionsProgramId, tokenProgramId, associatedTokenProgramId };
export const systemProgramId = SystemProgram.programId;
export const metadataProgramId = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

export const solMint = new PublicKey("So11111111111111111111111111111111111111112");
export const usdcMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const usdtMint = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");

export function associatedTokenAddress(owner: PublicKey, mint: PublicKey, programId?: PublicKey): PublicKey {
  const tokenProgram = programId ?? tokenProgramId;
  const seeds = [owner.toBuffer(), tokenProgram.toBuffer(), mint.toBuffer()];
  return PublicKey.findProgramAddressSync(seeds, associatedTokenProgramId)[0];
}

export const jewlProgramId = new PublicKey(idl.address);
export const feeConfigAddress = PublicKey.findProgramAddressSync([Buffer.from("fee")], jewlProgramId)[0];

export function allocationAddress(nftMint: PublicKey): PublicKey {
  const seeds = [Buffer.from("allocation"), nftMint.toBuffer()];
  return PublicKey.findProgramAddressSync(seeds, jewlProgramId)[0];
}

export function metadataAddress(mint: PublicKey): PublicKey {
  const seeds = [Buffer.from("metadata"), metadataProgramId.toBuffer(), mint.toBuffer()];
  return PublicKey.findProgramAddressSync(seeds, metadataProgramId)[0];
}

export function shortAddress(publicKey: PublicKey | string, chars = 4): string {
  const numChars = Math.max(4, Math.min(chars, 8));
  const key = publicKey.toString();
  const prefix = key.slice(0, numChars);
  const suffix = key.slice(-numChars);
  return `${prefix}...${suffix}`;
}

export function publicKeyOrDefault(publicKey?: string | null): PublicKey {
  if (publicKey == null) {
    return PublicKey.default;
  }
  try {
    return new PublicKey(publicKey);
  } catch {
    return PublicKey.default;
  }
}


