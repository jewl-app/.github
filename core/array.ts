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


type MapCallback<T, U> = (value: NonNullable<T>, index: number, array: Array<T>) => U;

declare global {
  interface Array<T> {
    mapNonNull: <U>(callback: MapCallback<T, U>) => Array<U | null>;
  }
}

Array.prototype.mapNonNull = function<T, U>(this: Array<T>, callback: MapCallback<T, U>): Array<U | null> {
  return this.map((value, index, array) => {
    if (value == null) {
      return null;
    }
    return callback(value, index, array);
  });
};
