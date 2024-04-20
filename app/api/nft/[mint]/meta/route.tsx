import { NextRequest, NextResponse } from "next/server";

interface MetaProps {
  readonly params: { mint: string };
}

export function GET (_request: NextRequest, props: MetaProps): NextResponse {
  return NextResponse.json({
    name: "jewl",
    symbol: "",
    description: "Tax-efficient on-chain renumeration.",
    image: `https://jewl.app/api/nft/${props.params.mint}/image`,
    external_url: "https://jewl.app/",
  });
}
