import clsx from "clsx";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

interface NftProps {
  readonly params: { mint: string };
}

export function GET(_request: NextRequest, props: NftProps): ImageResponse {
  const width = 512;
  const height = 512;
  const mintPrefix = props.params.mint.slice(0, 4);
  const mintSuffix = props.params.mint.slice(-4);
  const element = (
    <div tw={clsx("w-full h-full flex justify-center content-center")}>
      {mintPrefix}...{mintSuffix}
    </div>
  );
  return new ImageResponse(element, { width, height });
}
