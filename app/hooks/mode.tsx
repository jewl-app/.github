import { useEffect, useState } from "react";

export type WindowMode = "light" | "dark";

export interface UseWindowMode {
  readonly mode: WindowMode;
}

export function useWindowMode(): UseWindowMode {
  const [mode, setMode] = useState<WindowMode>("light");

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const modeChanged = (): void => {
      setMode(query.matches ? "dark" : "light");
    };
    modeChanged();
    query.addEventListener("change", modeChanged);
    return () => { query.removeEventListener("change", modeChanged); };
  }, []);

  return { mode };
}
