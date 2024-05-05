import type { PropsWithChildren, ReactElement } from "react";
import React, { Suspense, createContext, useCallback, useContext, useMemo, useState } from "react";
import clsx from "clsx";
import Spinner from "@/app/components/spinner";

export interface UsePopup {
  openPopup: (node: ReactElement, closeOnBackground?: boolean) => void;
  closePopup: () => void;
  setCloseOnBackground: (closesOnBackground: boolean) => void;
  readonly popup: ReactElement | null;
}

export const PopupContext = createContext<UsePopup>({
  openPopup: () => { /* Empty */ },
  closePopup: () => { /* Empty */ },
  setCloseOnBackground: () => { /* Empty */ },
  popup: null,
});

export function usePopup(): UsePopup {
  return useContext(PopupContext);
}

export default function PopupProvider(props: PropsWithChildren): ReactElement {
  const [popup, setPopup] = useState<ReactElement | null>(null);
  const [closeOnBackground, setCloseOnBackground] = useState(false);

  const openPopup = useCallback((node: ReactElement, closesOnBackground = true) => {
    setPopup(node);
    setCloseOnBackground(closesOnBackground);
  }, [setPopup, setCloseOnBackground]);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, [setPopup]);

  const popupNode = useMemo(() => {
    if (popup == null) { return null; }
    const onClick = closeOnBackground ? closePopup : undefined;
    return (
      <>
        <div
          className="fixed z-40 top-0 left-0 w-screen h-screen bg-black bg-opacity-50"
          onClick={onClick}
        />
        <div className={clsx(
          "fixed z-50 top-1/2 left-1/2 p-4 -translate-x-1/2 -translate-y-1/2",
          "flex flex-col items-center justify-center",
          "min-h-60 max-h-11/12 w-11/12 max-w-lg",
          "overflow-y-auto overflow-x-hidden",
          "scrollbar-track-gray-100 scrollbar-thumb-gray-300",
          "bg-slate-200 dark:bg-slate-800",
          "text-slate-900 dark:text-slate-100",
          "rounded-xl shadow-2xl",
        )}>
          <Suspense fallback={<Spinner />}>
            {popup}
          </Suspense>
        </div>
      </>
    );
  }, [popup, closeOnBackground]);

  const context = useMemo(() => {
    return { openPopup, closePopup, setCloseOnBackground, popup };
  }, [openPopup, closePopup, setCloseOnBackground, popup]);

  return (
    <PopupContext.Provider value={context}>
      {props.children}
      {popupNode}
    </PopupContext.Provider>
  );
}
