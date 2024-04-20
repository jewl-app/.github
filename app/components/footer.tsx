import type { ReactElement } from "react";
import React, { useCallback, useMemo } from "react";
import { useWindowSize } from "@/app/hooks/size";

export default function Footer(): ReactElement {
  const { width } = useWindowSize();

  const isPhone = useMemo(() => width < 768, [width]);
  const copyright = useMemo(() => isPhone ? "© 2023" : "© 2023 jewl.app", [isPhone]);

  return (
    <div className="text-sm flex content-center mx-1">
      <span className="p-1">{copyright}</span>
      <span className="flex-1" />
      {/* TODO: social links? */}
    </div>
  );
}
