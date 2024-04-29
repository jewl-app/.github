export const stripNonDigits = (str: string, allowDecimal = false): string => {
  const allowed = new Set(allowDecimal ? "0123456789." : "0123456789");
  let result = "";
  let decimal = false;
  for (const char of str) {
    if (!allowed.has(char)) { continue; }
    if (char === ".") {
      if (decimal) { continue; }
      decimal = true;
    }
    result = `${result}${char}`;
  }
  return result;
};

const multipliers = [
  { value: 1e9, symbol: "B" },
  { value: 1e6, symbol: "M" },
  { value: 1e3, symbol: "k" },
];

export const formatLargeNumber = (num: number): string => {
  const multiplier = multipliers.find(value => num >= value.value);
  if (multiplier === undefined) { return num.toFixed(2); }
  const value = num / multiplier.value;
  const fixed = value.toFixed(1);
  return `${fixed}${multiplier.symbol}`;
};


export const formatPriceDelta = (delta: number): string => {
  if (delta < -0.01) { return "▼▼▼"; }
  if (delta < -0.005) { return "▼▼"; }
  if (delta < -0.0005) { return "▼"; }
  if (delta > 0.01) { return "▲▲▲"; }
  if (delta > 0.005) { return "▲▲"; }
  if (delta > 0.0005) { return "▲"; }
  return "";
};
