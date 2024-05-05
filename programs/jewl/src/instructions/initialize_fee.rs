use anchor_lang::prelude::*;

use crate::state::fee::FeeConfigAccount;

pub fn initialize_fee(ctx: Context<InitializeFeeState>, fee_bps: Option<u16>, fee_authority: Option<Pubkey>, fee_withdraw_authority: Option<Pubkey>) -> Result<()> {
    // If not initialized set the defaults first
    if !ctx.accounts.fee_config.initialized {
        ctx.accounts.fee_config.fee_authority = *ctx.accounts.signer.key;
        ctx.accounts.fee_config.fee_withdraw_authority = *ctx.accounts.signer.key;
        ctx.accounts.fee_config.fee_bps = 100;
        ctx.accounts.fee_config.initialized = true;
    } else if fee_bps.is_none() && fee_authority.is_none() && fee_withdraw_authority.is_none() {
        return Err(ProgramError::InvalidInstructionData.into());
    }

    // Set the new values if they are provided
    if let Some(new_fee_authority) = fee_authority {
        ctx.accounts.fee_config.fee_authority = new_fee_authority;
    }

    if let Some(new_fee_withdraw_authority) = fee_withdraw_authority {
        ctx.accounts.fee_config.fee_withdraw_authority = new_fee_withdraw_authority;
    }

    if let Some(new_fee_bps) = fee_bps {
        ctx.accounts.fee_config.fee_bps = new_fee_bps;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeFeeState<'info> {
    #[account(
        mut,
        constraint = !fee_config.initialized || fee_config.fee_authority == signer.key()
    )]
    pub signer: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [FeeConfigAccount::seed()],
        bump,
        space = FeeConfigAccount::space(),
        payer = signer,
    )]
    pub fee_config: Box<InterfaceAccount<'info, FeeConfigAccount>>,

    #[account()]
    pub system_program: Program<'info, System>,
}
