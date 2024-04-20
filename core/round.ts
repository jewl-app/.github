

export function round (n: number, nearest = 0): number {
  if (nearest === 0) { return Math.round(n); }
  return Math.round(n / nearest) * nearest;
}

export function ceil (n: number, nearest = 0): number {
  if (nearest === 0) { return Math.ceil(n); }
  return Math.ceil(n / nearest) * nearest;
}

export function floor (n: number, nearest = 0): number {
  if (nearest === 0) { return Math.floor(n); }
  return Math.floor(n / nearest) * nearest;
}
