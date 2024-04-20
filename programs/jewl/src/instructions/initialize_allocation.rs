use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_2022::spl_token_2022::extension::mint_close_authority::MintCloseAuthority;
use anchor_spl::token_2022::spl_token_2022::extension::{BaseStateWithExtensions, StateWithExtensions};
use anchor_spl::token_2022::spl_token_2022::state::Mint as StateMint;
use anchor_spl::token_2022::Token2022;
use anchor_spl::token_interface::{TokenAccount, Mint};

use crate::id;
use crate::state::allocation::AllocationAccount;
use crate::state::fee::FeeConfigAccount;
use crate::utility::cpi::CrossProgramInvocations;
use crate::utility::signer::SeedSigner;

static SOL_MINT: Pubkey = Pubkey::new_from_array([
    6, 155, 136, 87, 254, 171, 129, 132,
    251, 104, 127, 99, 70, 24, 192, 53,
    218, 196, 57, 220, 26, 235, 59, 85,
    152, 160, 240, 0, 0, 0, 0, 1
]);

static USDC_MINT: Pubkey = Pubkey::new_from_array([
    198, 250, 122, 243, 190, 219, 173, 58,
    61, 101, 243, 106, 171, 201, 116, 49,
    177, 187, 228, 194, 210, 246, 224, 228,
    124, 166, 2, 3, 69, 47, 93, 97
]);

static USDT_MINT: Pubkey = Pubkey::new_from_array([
    206, 1, 14, 96, 175, 237, 178, 39,
    23, 189, 99, 25, 47, 84, 20, 90,
    63, 150, 90, 51, 187, 130, 210, 199,
    2, 158, 178, 206, 30, 32, 130, 100
]);

pub fn initialize_allocation(ctx: Context<InitializeAllocationState>, authority: Option<Pubkey>) -> Result<()> {
    let bump = Pubkey::find_program_address(&[FeeConfigAccount::seed()], &id()).1;
    let signer: SeedSigner = &[&[FeeConfigAccount::seed(), &[bump]]];

    // TODO: mint close authoirty must be the fee config
    let mint_info = ctx.accounts.nft_mint.to_account_info();
    let mint_data = mint_info.try_borrow_data()?;
    let mint_state = StateWithExtensions::<StateMint>::unpack(&mint_data)?;
    let mint_close_extension = mint_state.get_extension::<MintCloseAuthority>()?;
    if mint_close_extension.close_authority.0 != ctx.accounts.fee_config.key() {
        return Err(ProgramError::InvalidAccountData.into());
    }
    drop(mint_data);

    // Mint the nft to the signer if not already minted
    if ctx.accounts.nft_mint.supply == 0 {
        CrossProgramInvocations::mint_token(
            ctx.accounts.nft_mint.to_account_info(),
            ctx.accounts.nft_token.to_account_info(),
            ctx.accounts.fee_config.to_account_info(),
            ctx.accounts.token_extensions_program.to_account_info(),
            Some(signer),
            1,
        )?;
    }

    // Update the recover authority if signed by the recover authority
    if ctx.accounts.signer.key() == ctx.accounts.allocation.recover_authority.key() {
        if authority == Some(ctx.accounts.allocation.decrease_authority.key()) {
            return Err(ProgramError::InvalidInstructionData.into());
        }
        ctx.accounts.allocation.recover_authority = authority.unwrap_or_default();
    }

    // Update the decrease authority if signed by the decrease authority
    if ctx.accounts.signer.key() == ctx.accounts.allocation.decrease_authority.key() {
        if authority == Some(ctx.accounts.allocation.recover_authority.key()) {
            return Err(ProgramError::InvalidInstructionData.into());
        }
        ctx.accounts.allocation.decrease_authority = authority.unwrap_or_default();
    }

    // Initialize the allocation account if not initalized
    if !ctx.accounts.allocation.initialized {
        ctx.accounts.allocation.decrease_authority = authority.unwrap_or_default();
        ctx.accounts.allocation.recover_authority = ctx.accounts.signer.key();
        ctx.accounts.allocation.first_token_mint = SOL_MINT;
        ctx.accounts.allocation.second_token_mint = USDC_MINT;
        ctx.accounts.allocation.third_token_mint = USDT_MINT;
        ctx.accounts.allocation.initialized = true;
    }

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeAllocationState<'info> {
    #[account(
        mut,
        constraint = !allocation.initialized || signer.key() == allocation.recover_authority.key() || signer.key() == allocation.decrease_authority.key(),
    )]
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
        constraint = allocation.initialized || nft_mint.supply == 0
    )]
    pub nft_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        associated_token::mint = nft_mint,
        associated_token::authority = signer,
        associated_token::token_program = token_extensions_program,
        payer = signer
    )]
    pub nft_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        seeds = [AllocationAccount::seed(), nft_mint.key().as_ref()],
        space = AllocationAccount::space(),
        payer = signer,
        bump,
    )]
    pub allocation: Box<InterfaceAccount<'info, AllocationAccount>>,

    #[account()]
    pub system_program: Program<'info, System>,

    #[account()]
    pub token_extensions_program: Program<'info, Token2022>,

    #[account()]
    pub associated_token_program: Program<'info, AssociatedToken>,
}
