import { DependencyList, useCallback, useEffect } from "react";

export function useInterval(delay: number, callback: () => void, deps: DependencyList): void {
  const handler = useCallback(callback, deps);

  useEffect(() => {
    const interval = setInterval(callback, delay);
    handler();
    return () => clearInterval(interval);
  }, [delay, handler, ...deps]);
}
