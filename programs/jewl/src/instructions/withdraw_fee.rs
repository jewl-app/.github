use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Token;
use anchor_spl::token_interface::{TokenAccount, Mint};

use crate::id;
use crate::state::fee::FeeConfigAccount;
use crate::utility::cpi::CrossProgramInvocations;
use crate::utility::signer::SeedSigner;

pub fn withdraw_fee(ctx: Context<WithdrawFeeState>, amount: Option<u64>) -> Result<()> {
    let bump = Pubkey::find_program_address(&[FeeConfigAccount::seed()], &id()).1;
    let signer: SeedSigner = &[&[FeeConfigAccount::seed(), &[bump]]];

    // Transfer the fee token to the signer's token account
    let transfer_amount = amount.unwrap_or(ctx.accounts.fee_token_account.amount);
    CrossProgramInvocations::transfer_token(
        ctx.accounts.fee_token_account.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.signer_token_account.to_account_info(),
        ctx.accounts.fee_config.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(signer),
        transfer_amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // Close the fee token account if the full amount was withdrawn
    if transfer_amount == ctx.accounts.fee_token_account.amount {
        CrossProgramInvocations::close_token(
            ctx.accounts.fee_token_account.to_account_info(),
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.fee_config.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            Some(signer),
        )?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawFeeState<'info> {
    #[account(
        mut,
        constraint = fee_config.fee_withdraw_authority.key() == signer.key()
    )]
    pub signer: Signer<'info>,

    #[account(
        seeds = [FeeConfigAccount::seed()],
        bump,
        constraint = fee_config.initialized
    )]
    pub fee_config: Box<InterfaceAccount<'info, FeeConfigAccount>>,

    #[account(
        mint::token_program = token_program,
        constraint = token_mint.decimals > 0
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        associated_token::mint = token_mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub signer_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::mint = token_mint,
        token::authority = fee_config,
        token::token_program = token_program,
    )]
    pub fee_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account()]
    pub system_program: Program<'info, System>,

    #[account()]
    pub token_program: Program<'info, Token>,

    #[account()]
    pub associated_token_program: Program<'info, AssociatedToken>,
}
