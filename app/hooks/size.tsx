import { useEffect, useState } from "react";

export interface UseWindowSize {
  readonly width: number;
  readonly height: number;
}

export function useWindowSize (): UseWindowSize {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const aspectChanged = (): void => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    aspectChanged();
    window.addEventListener("resize", aspectChanged);
    return () => window.removeEventListener("resize", aspectChanged);
  }, []);

  return { width, height };
}
