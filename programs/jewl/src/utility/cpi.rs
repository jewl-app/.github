use anchor_lang::prelude::{CpiContext, AccountInfo, Result};
use anchor_lang::{ToAccountInfos, ToAccountMetas};
use anchor_spl::token_2022::{burn, close_account, freeze_account, mint_to, thaw_account, transfer_checked, Burn, CloseAccount, FreezeAccount, MintTo, ThawAccount, TransferChecked};

use crate::utility::signer::SeedSigner;

pub struct CrossProgramInvocations;
impl <'a, 'b, 'c, 'info> CrossProgramInvocations {

  pub fn cpi_context<T: ToAccountMetas + ToAccountInfos<'info>>(
    program_id: AccountInfo<'info>,
    accounts: T,
    signer: Option<SeedSigner<'a, 'b, 'c>>,
  ) -> CpiContext<'a, 'b, 'c, 'info, T> {
    if let Some(signer) = signer {
      CpiContext::new_with_signer(program_id, accounts, signer)
    } else {
      CpiContext::new(program_id, accounts)
    }
  }

    pub fn transfer_token(
      sender: AccountInfo<'info>,
      mint: AccountInfo<'info>,
      receiver: AccountInfo<'info>,
      authority: AccountInfo<'info>,
      token_program: AccountInfo<'info>,
      signer: Option<SeedSigner<'a, 'b, 'c>>,
      amount: u64,
      decimals: u8
    ) -> Result<()> {
        let accounts = TransferChecked {
            from: sender,
            mint,
            to: receiver,
            authority,
        };
        let context = Self::cpi_context(token_program, accounts, signer);
        transfer_checked(context, amount, decimals)
    }

    pub fn close_token(
      account: AccountInfo<'info>,
      destination: AccountInfo<'info>,
      authority: AccountInfo<'info>,
      token_program: AccountInfo<'info>,
      signer: Option<SeedSigner<'a, 'b, 'c>>,
    ) -> Result<()> {
        let accounts = CloseAccount {
            account,
            destination,
            authority,
        };
        let context = Self::cpi_context(token_program, accounts, signer);
        close_account(context)
    }

    pub fn freeze_token(
      account: AccountInfo<'info>,
      mint: AccountInfo<'info>,
      authority: AccountInfo<'info>,
      token_program: AccountInfo<'info>,
      signer: Option<SeedSigner<'a, 'b, 'c>>,
    ) -> Result<()> {
      let accounts = FreezeAccount {
          account,
          mint,
          authority,
      };
      let context = Self::cpi_context(token_program, accounts, signer);
      freeze_account(context)
    }

    pub fn thaw_token(
      account: AccountInfo<'info>,
      mint: AccountInfo<'info>,
      authority: AccountInfo<'info>,
      token_program: AccountInfo<'info>,
      signer: Option<SeedSigner<'a, 'b, 'c>>,
    ) -> Result<()> {
      let accounts = ThawAccount {
          account,
          mint,
          authority,
      };
      let context = Self::cpi_context(token_program, accounts, signer);
      thaw_account(context)
    }

    pub fn mint_token(
      mint: AccountInfo<'info>,
      account: AccountInfo<'info>,
      authority: AccountInfo<'info>,
      token_program: AccountInfo<'info>,
      signer: Option<SeedSigner<'a, 'b, 'c>>,
      amount: u64,
    ) -> Result<()> {
        let accounts = MintTo {
            mint,
            to: account,
            authority,
        };
        let context = Self::cpi_context(token_program, accounts, signer);
        mint_to(context, amount)
    }

    pub fn burn_token(
      mint: AccountInfo<'info>,
      account: AccountInfo<'info>,
      authority: AccountInfo<'info>,
      token_program: AccountInfo<'info>,
      signer: Option<SeedSigner<'a, 'b, 'c>>,
      amount: u64,
    ) -> Result<()> {
        let accounts = Burn {
            mint,
            from: account,
            authority,
        };
        let context = Self::cpi_context(token_program, accounts, signer);
        burn(context, amount)
    }
}
