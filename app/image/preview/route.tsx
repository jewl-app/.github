import { ImageResponse } from "next/og";
import React from "react";

type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type Style = "normal" | "italic";

interface FontOption {
  data: Buffer | ArrayBuffer;
  name: string;
  weight?: Weight;
  style?: Style;
  lang?: string;
}

const fontOptions: Array<FontOption> = [];

const getCachedFonts = async (): Promise<Array<FontOption>> => {
  if (fontOptions.length > 0) {
    return fontOptions;
  }

  const sourceMedium = await fetch("https://github.com/adobe-fonts/source-sans/raw/release/TTF/SourceSans3-Medium.ttf")
    .then(async x => x.arrayBuffer());
  const sourceBlack = await fetch("https://github.com/adobe-fonts/source-sans/raw/release/TTF/SourceSans3-Black.ttf")
    .then(async x => x.arrayBuffer());

  return [
    { name: "SourceSans3", style: "normal", weight: 500, data: sourceMedium },
    { name: "SourceSans3", style: "normal", weight: 900, data: sourceBlack },
  ];
};


export async function GET(): Promise<ImageResponse> {
  const width = 800;
  const height = 418;

  const fonts = await getCachedFonts();

  const element = (
    <div tw="w-full h-full bg-emerald-900 text-slate-200 flex flex-col justify-center">
      <div tw="mx-10 text-6xl font-black">
        Wrap fungible tokens into NFTs
      </div>
      <div tw="mx-10 my-4 text-sm font-medium">
        Create a unique NFT with a collection of fungible tokens.
      </div>
    </div>
  );
  return new ImageResponse(element, { width, height, fonts });
}
