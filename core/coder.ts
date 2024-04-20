import type { Jewl } from "@/target/types/jewl";
import type { Idl, IdlAccounts } from "@coral-xyz/anchor";
import { BN, BorshAccountsCoder } from "@coral-xyz/anchor";
import { PublicKey, AccountInfo } from "@solana/web3.js";
import idl from "@/target/idl/jewl.json";
import { jewlProgramId } from "@/core/address";
import { convertIdlToCamelCase } from "@coral-xyz/anchor/dist/cjs/idl";

const coder = new BorshAccountsCoder(convertIdlToCamelCase(idl as Idl));

type WithAddress<T> = {
  readonly address: PublicKey;
} & T;

type AsBigInt<T> = { [K in keyof T]: T[K] extends BN ? bigint : T[K] };
type AsBN<T> = { [K in keyof T]: T[K] extends bigint ? BN : T[K] };

type BorshFeeConfigAccount = IdlAccounts<Jewl>["feeConfigAccount"];
type BorshAllocationAccount = IdlAccounts<Jewl>["allocationAccount"];

export type FeeConfigAccount = AsBigInt<BorshFeeConfigAccount>;
export type AllocationAccount = AsBigInt<BorshAllocationAccount>;

export function convertToBigInt<T extends object> (object: T): AsBigInt<T> {
  const result: Record<string, unknown> = {};
  for (const key in object) {
    const value = object[key] as unknown;
    if (value instanceof BN) {
      result[key] = BigInt(value.toString());
    } else {
      result[key] = value;
    }
  }
  return result as AsBigInt<T>;
}

export function convertFromBigInt<T extends object> (object: T): AsBN<T> {
  const result: Record<string, unknown> = {};
  for (const key in object) {
    const value = object[key] as unknown;
    if (typeof value === "bigint") {
      result[key] = new BN(value.toString());
    } else {
      result[key] = value;
    }
  }
  return result as AsBN<T>;
}

export function unpackFeeConfig (address: PublicKey, accountInfo: AccountInfo<Buffer | Uint8Array>, programId = jewlProgramId): WithAddress<FeeConfigAccount> {
  if (!accountInfo.owner.equals(programId)) {
    throw new Error("Invalid owner");
  }
  const data = Buffer.from(accountInfo.data);
  const decoded = coder.decode<BorshFeeConfigAccount>("feeConfigAccount", data);
  return convertToBigInt({ address, ...decoded });
}

export function unpackAllocation (address: PublicKey, accountInfo: AccountInfo<Buffer | Uint8Array>, programId = jewlProgramId): WithAddress<AllocationAccount> {
  if (!accountInfo.owner.equals(programId)) {
    throw new Error("Invalid owner");
  }
  const data = Buffer.from(accountInfo.data);
  const decoded = coder.decode<BorshAllocationAccount>("allocationAccount", data);
  return convertToBigInt({ address, ...decoded });
}

export function packFeeConfig (state: FeeConfigAccount): Promise<Buffer> {
  const stateBN = convertFromBigInt(state);
  return coder.encode("feeConfigAccount", stateBN);
}

export function packAllocation (state: AllocationAccount): Promise<Buffer> {
  const stateBN = convertFromBigInt(state);
  return coder.encode("allocationAccount", stateBN);
}
