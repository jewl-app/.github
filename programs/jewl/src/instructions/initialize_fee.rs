use anchor_lang::prelude::*;

use crate::state::fee::FeeConfigAccount;

pub fn initialize_fee(ctx: Context<InitializeFeeState>, fee_bps: u16, withdraw_authority: Option<Pubkey>) -> Result<()> {
    ctx.accounts.fee_config.fee_authority = *ctx.accounts.signer.key;
    ctx.accounts.fee_config.fee_bps = fee_bps;
    ctx.accounts.fee_config.fee_withdraw_authority = withdraw_authority.unwrap_or(*ctx.accounts.signer.key);
    ctx.accounts.fee_config.initialized = true;

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
