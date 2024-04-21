import { PublicKey } from "@solana/web3.js";
import type { ReactElement } from "react";
import React from "react";

interface AllocationProps {
  nftMint?: PublicKey;
}

export default function Allocation(props: AllocationProps): ReactElement {

  // pie chart on usd values
  // Total usd value in big

  // action buttons (which are disabled if not right wallet connected). Circle buttons with icon and text underneath
  // add, remove, exercise
  // in admin mode show withdraw button instead

  // show list of tokens with amounts and usd equivalent

  // back button if not in admin mode

  return (
    <div className="">
      Allocation {props.nftMint?.toBase58()}
    </div>
  );
}
