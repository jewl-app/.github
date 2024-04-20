import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import { useWindowMode } from "@/app/hooks/mode";
import Image from "next/image";

export default function Front(): ReactElement | null {
  const [link, setLink] = useState<string>();
  const { mode } = useWindowMode();

  useEffect(() => {
    const newLink = mode === "dark" ? "/api/logo/transparent" : "/api/logo/circle";
    setLink(newLink);
  }, [mode]);

  if (link == null) { return null; }
  return (
    <div className="flex flex-1 items-center justify-center">
      <Image className="rounded-full self-center" src={link} alt="Under construction" width={256} height={256} />
    </div>
  );
}
