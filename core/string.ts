
export interface StripNonDigitsOptions {
  readonly allowDecimal?: boolean;
  readonly allowNegative?: boolean;
}

export function stripCharacters(str: string, allowedCharacters: Set<string> | Array<string> | string): string {
  const charSet = new Set(allowedCharacters);
  let result = "";
  for (const char of str) {
    if (!charSet.has(char)) { continue; }
    result += char;
  }
  return result;
}

export function stripNonDigits(str: string, opts?: StripNonDigitsOptions): string {
  const charSet = new Set("0123456789");
  if (opts?.allowDecimal ?? true) { charSet.add("."); }


  let startIndex = 0;
  let result = "";
  let foundDecimal = false;

  if ((opts?.allowNegative ?? true) && str.startsWith("-")) {
    // skip first index if negative is allowed and first character is "-"
    startIndex = 1;
    result = "-";
  }

  for (let i = startIndex; i < str.length; i += 1) {
    if (!charSet.has(str[i])) { continue; }
    if (str[i] === ".") {
      if (foundDecimal) { continue; }
      foundDecimal = true;
    }
    result += str[i];
  }
  return result;
}

const multipliers = [
  { value: 1e9, symbol: "B" },
  { value: 1e6, symbol: "M" },
  { value: 1e3, symbol: "k" },
];

export function formatLargeNumber(num: number): string {
  const multiplier = multipliers.find(value => num >= value.value);
  if (multiplier === undefined) { return num.toFixed(2); }
  const value = num / multiplier.value;
  const fixed = value.toFixed(1);
  return `${fixed}${multiplier.symbol}`;
}

export function formatPriceDelta(delta: number): string {
  if (delta < -0.01) { return "▼▼▼"; }
  if (delta < -0.005) { return "▼▼"; }
  if (delta < -0.0005) { return "▼"; }
  if (delta > 0.01) { return "▲▲▲"; }
  if (delta > 0.005) { return "▲▲"; }
  if (delta > 0.0005) { return "▲"; }
  return "";
}
