import { useRef } from "react";

export function useStatic<T>(value: T): T {
  const ref = useRef(value);
  ref.current = value;
  return ref.current;
}
