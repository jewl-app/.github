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

pub fn decrease_allocation(ctx: Context<DecreaseAllocationState>, amount: u64) -> Result<()> {
    let expected_amount: u64;

    if ctx.accounts.allocation.first_token_mint == ctx.accounts.token_mint.key() {
        expected_amount = ctx.accounts.allocation.first_token_amount;
        ctx.accounts.allocation.first_token_amount = ctx.accounts.allocation.first_token_amount
            .checked_sub(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
    } else if ctx.accounts.allocation.second_token_mint == ctx.accounts.token_mint.key() {
        expected_amount = ctx.accounts.allocation.second_token_amount;
        ctx.accounts.allocation.second_token_amount = ctx.accounts.allocation.second_token_amount
            .checked_sub(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
    } else if ctx.accounts.allocation.third_token_mint == ctx.accounts.token_mint.key() {
        expected_amount = ctx.accounts.allocation.third_token_amount;
        ctx.accounts.allocation.third_token_amount = ctx.accounts.allocation.third_token_amount
            .checked_sub(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
    } else {
        return Err(RuntimeError::TokenNotFound.into());
    }

    let mint = ctx.accounts.nft_mint.key();
    let bump = Pubkey::find_program_address(&[AllocationAccount::seed(), mint.as_ref()], &id()).1;
    let signer: SeedSigner = &[&[AllocationAccount::seed(), mint.as_ref(), &[bump]]];

    // If there is more tokens than expected transfer the difference to fee account
    if ctx.accounts.allocation_token_account.amount > expected_amount {
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

    // Transfer the amount from the allocation account to the signer account
    CrossProgramInvocations::transfer_token(
        ctx.accounts.allocation_token_account.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.signer_token_account.to_account_info(),
        ctx.accounts.allocation.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        Some(signer),
        amount,
        ctx.accounts.token_mint.decimals,
    )?;

    // If the allocation token account is now empty, close it
    if expected_amount == amount {
        CrossProgramInvocations::close_token(
            ctx.accounts.allocation_token_account.to_account_info(),
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.allocation.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            Some(signer),
        )?;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct DecreaseAllocationState<'info> {
    #[account(
        mut,
        constraint = signer.key() == allocation.decrease_authority.key()
    )]
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
        init_if_needed,
        associated_token::mint = token_mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub signer_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = allocation,
        associated_token::token_program = token_program,
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
