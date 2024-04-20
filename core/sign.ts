import { PublicKey } from "@solana/web3.js";
import type { Signer } from "@solana/web3.js";
import base58 from "bs58";
import { randomUUID } from "crypto";
import { sign } from "tweetnacl";
import util from "tweetnacl-util";
import { unix } from "@/core/time";

export interface Signature {
  readonly scope: string;
  readonly signer: PublicKey;
}

interface SignaturePayload {
  readonly scope: string;
  readonly nonce: string;
  readonly signer: string;
  readonly stamp: number;
}

interface Wallet {
  readonly publicKey: PublicKey;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

export function validateSignature (sig: string, expiry = 86400): Signature | null {
  const [data, signature] = sig.split(":");
  const buffer = base58.decode(data);
  const encoded = util.encodeUTF8(buffer);
  const payload = JSON.parse(encoded) as SignaturePayload;
  const signer = new PublicKey(payload.signer);
  if (payload.stamp <= unix() - expiry) { return null; }
  const decodedSignature = base58.decode(signature);
  const isValid = sign.detached.verify(
    new Uint8Array(buffer),
    new Uint8Array(decodedSignature),
    new Uint8Array(signer.toBytes()),
  );
  if (!isValid) { return null; }
  return { scope: payload.scope, signer };
}

export async function getSignature (signer: Signer | Wallet, keyScope: string): Promise<string> {
  const payload = {
    scope: keyScope,
    nonce: randomUUID(),
    signer: signer.publicKey.toBase58(),
    stamp: unix(),
  };
  const buffer = JSON.stringify(payload);
  const decoded = util.decodeUTF8(buffer);

  let signature = new Uint8Array();

  if ("signMessage" in signer) {
    signature = await signer.signMessage(decoded);
  }

  if ("secretKey" in signer) {
    signature = sign.detached(decoded, signer.secretKey);
  }

  return `${base58.encode(decoded)}:${base58.encode(signature)}`;
}
