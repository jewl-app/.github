use anchor_lang::prelude::{Pubkey, account, borsh};
use anchor_lang::{Owners, AnchorSerialize, AnchorDeserialize};

use crate::ID;
static IDS: [Pubkey; 1] = [ID];

#[account]
#[derive(Default, Debug, PartialEq)]
pub struct AllocationAccount {
    pub initialized: bool,
    pub decrease_authority: Pubkey,
    pub recover_authority: Pubkey,
    pub first_token_mint: Pubkey,
    pub first_token_amount: u64,
    pub second_token_mint: Pubkey,
    pub second_token_amount: u64,
    pub third_token_mint: Pubkey,
    pub third_token_amount: u64,
}

impl AllocationAccount {
    pub fn space() -> usize { 8 + 1 + 32 + 32 + 32 + 8 + 32 + 8 + 32 + 8 }
    pub fn seed() -> &'static [u8] { b"allocation" }
}

impl Owners for AllocationAccount {
    fn owners() -> &'static [Pubkey] {
        &IDS
    }
}
