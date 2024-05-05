export function interval(length: number, step = 1): Array<number> {
  return [...Array(length).keys()].map(i => i * step);
}

export function range(start: number, end: number, step = 1): Array<number> {
  const length = Math.ceil((end - start) / step);
  return [...Array(length).keys()].map(i => i * step).map(i => i + start);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function nonNull<T>(value: T | null | undefined): value is T {
  if (value == null) {
    return false;
  }
  return true;
}
