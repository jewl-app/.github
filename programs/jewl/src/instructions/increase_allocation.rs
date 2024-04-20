use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Token;
use anchor_spl::token_interface::{TokenAccount, Mint};

use crate::id;
use crate::state::allocation::AllocationAccount;
use crate::state::fee::FeeConfigAccount;
use crate::utility::cpi::CrossProgramInvocations;
use crate::utility::error::RuntimeError;
use crate::utility::signer::SeedSigner;

const MAX_BPS: u16 = 10000;

pub fn increase_allocation(ctx: Context<IncreaseAllocationState>, amount: u64) -> Result<()> {
    let expected_amount: u64;
    let allocation_amount = amount
        .checked_mul(MAX_BPS.saturating_sub(ctx.accounts.fee_config.fee_bps).into())
        .ok_or(ProgramError::ArithmeticOverflow)?
        .checked_div(MAX_BPS.into())
        .ok_or(ProgramError::ArithmeticOverflow)?;
    let fee_amount = amount
        .checked_sub(allocation_amount)
        .ok_or(ProgramError::ArithmeticOverflow)?;

    if ctx.accounts.allocation.first_token_mint == ctx.accounts.token_mint.key() {
        expected_amount = ctx.accounts.allocation.first_token_amount;
        ctx.accounts.allocation.first_token_amount = ctx.accounts.allocation.first_token_amount
            .checked_add(allocation_amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
    } else if ctx.accounts.allocation.second_token_mint == ctx.accounts.token_mint.key() {
        expected_amount = ctx.accounts.allocation.second_token_amount;
        ctx.accounts.allocation.second_token_amount = ctx.accounts.allocation.second_token_amount
            .checked_add(allocation_amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
    } else if ctx.accounts.allocation.third_token_mint == ctx.accounts.token_mint.key() {
        expected_amount = ctx.accounts.allocation.third_token_amount;
        ctx.accounts.allocation.third_token_amount = ctx.accounts.allocation.third_token_amount
            .checked_add(allocation_amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
    } else if ctx.accounts.allocation.first_token_amount == 0 {
        expected_amount = 0;
        ctx.accounts.allocation.first_token_mint = ctx.accounts.token_mint.key();
        ctx.accounts.allocation.first_token_amount = allocation_amount;
    } else if ctx.accounts.allocation.second_token_amount == 0 {
        expected_amount = 0;
        ctx.accounts.allocation.second_token_mint = ctx.accounts.token_mint.key();
        ctx.accounts.allocation.second_token_amount = allocation_amount;
    } else if ctx.accounts.allocation.third_token_amount == 0 {
        expected_amount = 0;
        ctx.accounts.allocation.third_token_mint = ctx.accounts.token_mint.key();
        ctx.accounts.allocation.third_token_amount = allocation_amount;
    } else {
        return Err(RuntimeError::MaxTokensReached.into());
    }

    // If there is more tokens than expected transfer the difference to fee account
    if ctx.accounts.allocation_token_account.amount > expected_amount {
        let mint = ctx.accounts.nft_mint.key();
        let bump = Pubkey::find_program_address(&[AllocationAccount::seed(), mint.as_ref()], &id()).1;
        let signer: SeedSigner = &[&[AllocationAccount::seed(), mint.as_ref(), &[bump]]];
        let transfer_amount = ctx.accounts.allocation_token_account.amount
            .checked_sub(expected_amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        CrossProgramInvocations::transfer_token(
            ctx.accounts.allocation_token_account.to_account_info(),
            ctx.accounts.token_mint.to_account_info(),
            ctx.accounts.fee_token_account.to_account_info(),
            ctx.accounts.allocation.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            Some(signer),
            transfer_amount,
            ctx.accounts.token_mint.decimals,
        )?;
    }

    // Transfer the allocation amount to the allocation
    CrossProgramInvocations::transfer_token(
        ctx.accounts.signer_token_account.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.allocation_token_account.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        None,
        allocation_amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // Transfer the protocol fee to the fee account
    CrossProgramInvocations::transfer_token(
        ctx.accounts.signer_token_account.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.fee_token_account.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        None,
        fee_amount,
        ctx.accounts.token_mint.decimals,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct IncreaseAllocationState<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [FeeConfigAccount::seed()],
        bump,
        constraint = fee_config.initialized
    )]
    pub fee_config: Box<InterfaceAccount<'info, FeeConfigAccount>>,

    #[account(
        mint::authority = fee_config,
        mint::decimals = 0,
        constraint = nft_mint.supply == 1
    )]
    pub nft_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [AllocationAccount::seed(), nft_mint.key().as_ref()],
        constraint = allocation.initialized,
        bump
    )]
    pub allocation: Box<InterfaceAccount<'info, AllocationAccount>>,

    #[account(
        mint::token_program = token_program,
        constraint = token_mint.decimals > 0
    )]
    pub token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
    )]
    pub signer_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        associated_token::mint = token_mint,
        associated_token::authority = allocation,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub allocation_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        associated_token::mint = token_mint,
        associated_token::authority = fee_config,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub fee_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account()]
    pub system_program: Program<'info, System>,

    #[account()]
    pub token_program: Program<'info, Token>,

    #[account()]
    pub associated_token_program: Program<'info, AssociatedToken>,
}
