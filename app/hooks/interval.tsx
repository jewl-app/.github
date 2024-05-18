import type { DependencyList } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAnalytics } from "@/app/hooks/analytics";

interface UseInterval<T> {
  readonly loading: boolean;
  readonly result: T | null;
  readonly reload: () => void;
}

interface UseIntervalPropsBase<T> {
  interval?: number;
  callback: () => T | Promise<T>;
}

export function useInterval<T>(props: UseIntervalPropsBase<T>, deps: DependencyList): UseInterval<T> {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<T | null>(null);
  const [counter, setCounter] = useState<number>(0);
  const { logError } = useAnalytics();

  const interval = useMemo(() => {
    if (props.interval == null) {
      return 1000;
    }
    return props.interval * 1000;
  }, [props.interval]);

  const handler = useCallback((initial = false) => {
    const maybePromise = props.callback();
    if (maybePromise instanceof Promise) {
      setLoading(initial);
      maybePromise
        .then(setResult)
        .catch(logError)
        .finally(() => { setLoading(false); });
    } else {
      setResult(maybePromise);
    }
  }, [setLoading, counter, ...deps]);

  useEffect(() => {
    const id = setInterval(handler, interval ?? 1000);
    setResult(null);
    handler(true);
    return () => { clearInterval(id); };
  }, [interval, handler, setResult, logError]);

  const reload = useCallback(() => {
    setCounter(c => c + 1);
  }, [setCounter]);

  return {
    loading,
    result,
    reload,
  };
}
