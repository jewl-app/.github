use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::Token;
use anchor_spl::token_2022::Token2022;
use anchor_spl::token_interface::{TokenAccount, Mint};

use crate::id;
use crate::state::allocation::AllocationAccount;
use crate::state::fee::FeeConfigAccount;
use crate::utility::cpi::CrossProgramInvocations;
use crate::utility::signer::SeedSigner;

fn withdraw_token<'info>(
    nft_mint: &InterfaceAccount<'info, Mint>,
    signer_token: &InterfaceAccount<'info, TokenAccount>,
    allocation_token: &InterfaceAccount<'info, TokenAccount>,
    fee_token: &InterfaceAccount<'info, TokenAccount>,
    allocation: &InterfaceAccount<'info, AllocationAccount>,
    token_mint: &InterfaceAccount<'info, Mint>,
    token_program: &Program<'info, Token>,
    amount: u64
) -> Result<()> {
    let nft_mint_key = nft_mint.key();
    let bump = Pubkey::find_program_address(&[AllocationAccount::seed(), nft_mint_key.as_ref()], &id()).1;
    let signer: SeedSigner = &[&[AllocationAccount::seed(), nft_mint_key.as_ref(), &[bump]]];

    // If there are more tokens than the signer can withdraw, transfer the difference to the fee account
    if allocation_token.amount > amount {
        let transfer_amount = allocation_token.amount
            .checked_sub(amount)
            .ok_or(ProgramError::ArithmeticOverflow)?;
        CrossProgramInvocations::transfer_token(
            allocation_token.to_account_info(),
            token_mint.to_account_info(),
            fee_token.to_account_info(),
            allocation.to_account_info(),
            token_program.to_account_info(),
            Some(signer),
            transfer_amount,
            token_mint.decimals,
        )?;
    }

    // Transfer the amount from the allocation account to the signer account
    if amount > 0 {
        CrossProgramInvocations::transfer_token(
            allocation_token.to_account_info(),
            token_mint.to_account_info(),
            signer_token.to_account_info(),
            allocation.to_account_info(),
            token_program.to_account_info(),
            Some(signer),
            amount,
            token_mint.decimals,
        )?;
    }

    // Close allocation token account and reclaim rent
    CrossProgramInvocations::close_token(
        allocation_token.to_account_info(),
        signer_token.to_account_info(),
        allocation.to_account_info(),
        token_program.to_account_info(),
        Some(signer),
    )?;

    Ok(())
}

pub fn exercise_allocation(ctx: Context<ExerciseAllocationState>) -> Result<()> {
    let bump = Pubkey::find_program_address(&[FeeConfigAccount::seed()], &id()).1;
    let signer: SeedSigner = &[&[FeeConfigAccount::seed(), &[bump]]];

    // Withdraw the first token to signer
    withdraw_token(
        &ctx.accounts.nft_mint,
        &ctx.accounts.signer_first_token_account,
        &ctx.accounts.allocation_first_token_account,
        &ctx.accounts.fee_first_token_account,
        &ctx.accounts.allocation,
        &ctx.accounts.first_token_mint,
        &ctx.accounts.token_program,
        ctx.accounts.allocation.first_token_amount,
    )?;

    // Withdraw the second token to signer
    withdraw_token(
        &ctx.accounts.nft_mint,
        &ctx.accounts.signer_second_token_account,
        &ctx.accounts.allocation_second_token_account,
        &ctx.accounts.fee_second_token_account,
        &ctx.accounts.allocation,
        &ctx.accounts.second_token_mint,
        &ctx.accounts.token_program,
        ctx.accounts.allocation.second_token_amount,
    )?;

    // Withdraw the third token to signer
    withdraw_token(
        &ctx.accounts.nft_mint,
        &ctx.accounts.signer_third_token_account,
        &ctx.accounts.allocation_third_token_account,
        &ctx.accounts.fee_third_token_account,
        &ctx.accounts.allocation,
        &ctx.accounts.third_token_mint,
        &ctx.accounts.token_program,
        ctx.accounts.allocation.third_token_amount,
    )?;

    // Burn allocation nft
    CrossProgramInvocations::burn_token(
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.nft_token.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.token_extensions_program.to_account_info(),
        None,
        1,
    )?;

    // Close the nft token account and reclaim rent
    CrossProgramInvocations::close_token(
        ctx.accounts.nft_token.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.token_extensions_program.to_account_info(),
        None,
    )?;

    // Close the nft token mint and reclaim rent
    CrossProgramInvocations::close_token(
        ctx.accounts.nft_mint.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.fee_config.to_account_info(),
        ctx.accounts.token_extensions_program.to_account_info(),
        Some(signer),
    )?;

    // Close the allocation account and reclaim rent
    ctx.accounts.allocation
        .close(ctx.accounts.signer.to_account_info())?;

    Ok(())
}

#[derive(Accounts)]
pub struct ExerciseAllocationState<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [FeeConfigAccount::seed()],
        bump,
        constraint = fee_config.initialized
    )]
    pub fee_config: Box<InterfaceAccount<'info, FeeConfigAccount>>,

    #[account(
        mut,
        mint::authority = fee_config,
        mint::decimals = 0,
        mint::token_program = token_extensions_program,
    )]
    pub nft_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = nft_mint,
        associated_token::authority = signer,
        associated_token::token_program = token_extensions_program,
        constraint = nft_token.amount == 1
    )]
    pub nft_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [AllocationAccount::seed(), nft_mint.key().as_ref()],
        constraint = allocation.initialized,
        bump
    )]
    pub allocation: Box<InterfaceAccount<'info, AllocationAccount>>,

    #[account(
        mint::token_program = token_program,
        constraint = first_token_mint.key() == allocation.first_token_mint.key()
    )]
    pub first_token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        associated_token::mint = first_token_mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub signer_first_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        associated_token::mint = first_token_mint,
        associated_token::authority = allocation,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub allocation_first_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        associated_token::mint = first_token_mint,
        associated_token::authority = fee_config,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub fee_first_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mint::token_program = token_program,
        constraint = second_token_mint.key() == allocation.second_token_mint.key()
    )]
    pub second_token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        associated_token::mint = second_token_mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub signer_second_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        associated_token::mint = second_token_mint,
        associated_token::authority = allocation,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub allocation_second_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        associated_token::mint = second_token_mint,
        associated_token::authority = fee_config,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub fee_second_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mint::token_program = token_program,
        constraint = third_token_mint.key() == allocation.third_token_mint.key()
    )]
    pub third_token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        associated_token::mint = third_token_mint,
        associated_token::authority = signer,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub signer_third_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        associated_token::mint = third_token_mint,
        associated_token::authority = allocation,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub allocation_third_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        associated_token::mint = third_token_mint,
        associated_token::authority = fee_config,
        associated_token::token_program = token_program,
        payer = signer
    )]
    pub fee_third_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account()]
    pub system_program: Program<'info, System>,

    #[account()]
    pub token_program: Program<'info, Token>,

    #[account()]
    pub token_extensions_program: Program<'info, Token2022>,

    #[account()]
    pub associated_token_program: Program<'info, AssociatedToken>,
}
