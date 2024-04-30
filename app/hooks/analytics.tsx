import { Analytics, track } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useContext, useCallback, useMemo } from "react";

export interface UseAnalytics {
  logEvent: (name: string, params?: Record<string, string | number>) => void;
  logError: (error: unknown) => void;
}

export const AnalyticsContext = createContext<UseAnalytics>({
  logEvent: () => { throw new Error("No provider"); },
  logError: () => { throw new Error("No provider"); },
});

export function useAnalytics(): UseAnalytics {
  return useContext(AnalyticsContext);
}

export default function AnalyticsProvider(props: PropsWithChildren): ReactElement {

  const logEvent = useCallback((name: string, params?: Record<string, string | number>) => {
    track(name, params);
  }, []);

  const logError = useCallback((error: unknown) => {
    console.error(error);
  }, []);

  const context = useMemo(() => {
    return { logEvent, logError };
  }, [logEvent, logError]);

  return (
    <AnalyticsContext.Provider value={context}>
      {props.children}
      <Analytics />
      <SpeedInsights />
    </AnalyticsContext.Provider>
  );
}
