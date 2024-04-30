use anchor_lang::prelude::*;

declare_id!("JEWLJJ9c9dsrrCuq6gKvkiBsp74Sn4N9VdR68LY1X7x");

pub mod instructions;
pub mod state;
pub mod utility;

use crate::instructions::initialize_fee::{InitializeFeeState, initialize_fee as _initialize_fee, __client_accounts_initialize_fee_state};
use crate::instructions::initialize_allocation::{InitializeAllocationState, initialize_allocation as _initialize_allocation, __client_accounts_initialize_allocation_state};
use crate::instructions::increase_allocation::{IncreaseAllocationState, increase_allocation as _increase_allocation, __client_accounts_increase_allocation_state};
use crate::instructions::decrease_allocation::{DecreaseAllocationState, decrease_allocation as _decrease_allocation, __client_accounts_decrease_allocation_state};
use crate::instructions::exercise_allocation::{ExerciseAllocationState, exercise_allocation as _exercise_allocation, __client_accounts_exercise_allocation_state};
use crate::instructions::withdraw_fee::{WithdrawFeeState, withdraw_fee as _withdraw_fee, __client_accounts_withdraw_fee_state};

#[program]
pub mod jewl {
    use super::*;

    pub fn initialize_fee(ctx: Context<InitializeFeeState>, fee_bps: u16, withdraw_authority: Option<Pubkey>) -> Result<()> {
        _initialize_fee(ctx, fee_bps, withdraw_authority)
    }

    pub fn initialize_allocation(ctx: Context<InitializeAllocationState>, decrease_athority: Option<Pubkey>) -> Result<()> {
        _initialize_allocation(ctx, decrease_athority)
    }

    pub fn increase_allocation(ctx: Context<IncreaseAllocationState>, amount: u64) -> Result<()> {
        _increase_allocation(ctx, amount)
    }

    pub fn decrease_allocation(ctx: Context<DecreaseAllocationState>, amount: u64) -> Result<()> {
        _decrease_allocation(ctx, amount)
    }

    pub fn exercise_allocation(ctx: Context<ExerciseAllocationState>) -> Result<()> {
        _exercise_allocation(ctx)
    }

    pub fn withdraw_fee(ctx: Context<WithdrawFeeState>, amount: Option<u64>) -> Result<()> {
        _withdraw_fee(ctx, amount)
    }
}
