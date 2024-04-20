
export async function wait (ms: number): Promise<void> {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}

export function unix (): number {
  return Math.floor(Date.now() / 1000);
}

export function isAfter (timestamp: number, other = unix()): boolean {
  return timestamp >= other;
}

export function isBefore (timestamp: number, other = unix()): boolean {
  return timestamp <= other;
}

export function isEqual (timestamp: number, other = unix(), tolerance = 30): boolean {
  return Math.abs(timestamp - other) <= tolerance;
}
