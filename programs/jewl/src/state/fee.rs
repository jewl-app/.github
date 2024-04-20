use anchor_lang::prelude::{Pubkey, account, borsh};
use anchor_lang::{Owners, AnchorSerialize, AnchorDeserialize};

use crate::ID;
static IDS: [Pubkey; 1] = [ID];

#[account]
#[derive(Default, Debug, PartialEq)]
pub struct FeeConfigAccount {
    pub initialized: bool,
    pub fee_authority: Pubkey,
    pub fee_withdraw_authority: Pubkey,
    pub fee_bps: u16,
}

impl FeeConfigAccount {
    pub fn space() -> usize { 8 + 1 + 32 + 32 + 2 }
    pub fn seed() -> &'static [u8] { b"fee" }
}

impl Owners for FeeConfigAccount {
    fn owners() -> &'static [Pubkey] {
        &IDS
    }
}
