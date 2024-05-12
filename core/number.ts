import { stripNonDigits } from "@/core/string";

export function toDecimal(value: bigint, decimals: number): string {
  const valueString = value.toString().padStart(decimals + 1, "0");
  const prefix = valueString.slice(0, -decimals);
  const suffix = valueString.slice(-decimals);
  return `${prefix}.${suffix}`;
}

export function toNumber(value: bigint, decimals: number): number {
  return parseFloat(toDecimal(value, decimals));
}

export function fromDecimal(value: string, decimals: number): bigint {
  const decimalIndex = stripNonDigits(value).indexOf(".");
  const requiredDigits = decimals + decimalIndex;
  const prefix = stripNonDigits(value).slice(0, decimalIndex);
  const suffix = stripNonDigits(value).slice(decimalIndex + 1);
  const decimalString = `${prefix}${suffix}`
    .slice(0, requiredDigits)
    .padEnd(requiredDigits, "0");
  return BigInt(decimalString);
}

export function fromNumber(value: number, decimals: number): bigint {
  return fromDecimal(value.toString(), decimals);
}
