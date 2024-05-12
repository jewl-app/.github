import type { AccountInfo, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { getAccountsBatched } from "@/core/account";
import type { WithAddress } from "@/core/coder";
import { metadataAddress, metadataProgramId } from "@/core/address";
import { nonNull } from "@/core/array";

interface Creator {
  address: PublicKey;
  verified: boolean;
  share: number;
}

interface Collection {
  verified: boolean;
  key: PublicKey;
}

interface Uses {
  useMethod: number;
  remaining: bigint;
  total: bigint;
}

interface MetadataPrefix {
  key: number;
  updateAuthority: PublicKey;
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
}

interface MetadataCreators {
  creators: Array<Creator>;
}

interface MetadataSuffix {
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number | null;
  tokenStandard: number | null;
  collection: Collection | null;
  uses: Uses | null;
}

export type Metadata = WithAddress<MetadataPrefix & MetadataCreators & MetadataSuffix>;


function unpackMetadata(address: PublicKey, accountInfo: AccountInfo<Buffer>, programId = metadataProgramId): Metadata {
  if (!accountInfo.owner.equals(programId)) {
    throw new Error("Invalid owner");
  }
  const buffer = accountInfo.data;
  const [prefix, creatorsOffset] = parseMetadataPrefix(buffer, 0);
  const [creators, suffixOffset] = parseMetadataCreators(buffer, creatorsOffset);
  const [suffix] = parseMetadataSuffix(buffer, suffixOffset);
  return { address, ...prefix, ...creators, ...suffix };
}

function readString(buffer: Buffer, offset: number): string {
  const readLength = buffer.readUInt32LE(offset);
  const bytes = buffer.subarray(offset + 4, offset + 4 + readLength);
  const nullIndex = bytes.indexOf(0);
  return new TextDecoder().decode(bytes.subarray(0, nullIndex));
}

function parseMetadataPrefix(buffer: Buffer, offset: number): [MetadataPrefix, number] {
  const key = buffer.readUInt8(offset);
  offset += 1;
  const updateAuthority = new PublicKey(buffer.subarray(offset, offset + 32));
  offset += 32;
  const mint = new PublicKey(buffer.subarray(offset, offset + 32));
  offset += 32;
  const name = readString(buffer, offset);
  offset += 36;
  const symbol = readString(buffer, offset);
  offset += 14;
  const uri = readString(buffer, offset);
  offset += 204;
  const sellerFeeBasisPoints = buffer.readUInt16LE(offset);
  offset += 2;
  return [
    { key, updateAuthority, mint, name, symbol, uri, sellerFeeBasisPoints },
    offset,
  ];
}

function parseMetadataCreators(buffer: Buffer, offset: number): [MetadataCreators, number] {
  const creatorsPresent = !!buffer.readUInt8(offset);
  offset += 1;
  if (!creatorsPresent) {
    return [{ creators: [] }, offset];
  }
  const creatorCount = buffer.readUInt16LE(offset);
  offset += 4;
  let creators: Array<Creator> = [];
  for (let i = 0; i < creatorCount; i++) {
    const address = new PublicKey(buffer.subarray(offset, offset + 32));
    offset += 32;
    const verified = !!buffer.readUInt8(offset);
    offset += 1;
    const share = buffer.readUInt8(offset);
    offset += 1;
    creators.push({ address, verified, share });
  }
  return [{ creators }, offset];
}

function parseMetadataSuffix(buffer: Buffer, offset: number): [MetadataSuffix, number] {
  const primarySaleHappened = !!buffer.readUInt8(offset);
  offset += 1;
  const isMutable = !!buffer.readUInt8(offset);
  offset += 1;
  const editionNoncePresent = !!buffer.readUInt8(offset);
  offset += 1;
  let editionNonce: number | null = null;
  if (editionNoncePresent) {
    editionNonce = editionNoncePresent ? buffer.readUInt8(offset) : null;
    offset += 1;
  }
  const tokenStandardPresent = !!buffer.readUInt8(offset);
  offset += 1;
  let tokenStandard: number | null = null;
  if (tokenStandardPresent) {
    tokenStandard = tokenStandardPresent ? buffer.readUInt8(offset) : null;
    offset += 1;
  }
  const collectionPresent = !!buffer.readUInt8(offset);
  offset += 1;
  let collection: Collection | null = null;
  if (collectionPresent) {
    const collectionVerified = !!buffer.readUInt8(offset);
    offset += 1;
    const collectionKey = new PublicKey(buffer.subarray(offset, offset + 32));
    offset += 32;
    collection = collectionPresent ? { verified: collectionVerified, key: collectionKey } : null;
  }
  const usesPresent = !!buffer.readUInt8(offset);
  offset += 1;
  let uses: Uses | null = null;
  if (usesPresent) {
    const useMethod = buffer.readUInt8(offset);
    offset += 1;
    const remaining = buffer.readBigUInt64LE(offset);
    offset += 8;
    const total = buffer.readBigUInt64LE(offset);
    offset += 8;
    uses = usesPresent ? { useMethod, remaining, total } : null;
  }
  return [
    { primarySaleHappened, isMutable, editionNonce, tokenStandard, collection, uses },
    offset,
  ];
}


export async function getTokenMetadata(connection: Connection, mints: Array<string>): Promise<Map<string, Metadata>> {
  if (mints.length === 0) {
    return new Map();
  }
  const addresses = mints.map(mint => metadataAddress(new PublicKey(mint)));
  const accountInfos = await getAccountsBatched(connection, addresses);
  const metadatas = accountInfos
    .map((x, i) => x ? unpackMetadata(addresses[i], x) : null)
    .filter(nonNull);
  const result = new Map<string, Metadata>();
  for (const metadata of metadatas) {
    result.set(metadata.mint.toBase58(), metadata);
  }
  return result;
}
