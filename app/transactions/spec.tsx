import type { Allocation } from "@/core/allocation";
import type { FeeTokenAccount } from "@/core/fee";
import type { IconDefinition } from "@fortawesome/fontawesome-common-types";

export interface ButtonSpec {
  readonly icon: IconDefinition;
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean | string | null;
}

interface BaseButtonContext<T> {
  readonly reload: () => void;
  readonly value: T | null;
}

export type ButtonContext = BaseButtonContext<unknown>;
export type TreasuryButtonContext = BaseButtonContext<Array<FeeTokenAccount>>;
export type AllocationButtonContext = BaseButtonContext<Allocation>;
