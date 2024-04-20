use anchor_lang::error_code;

#[error_code]
pub enum RuntimeError {
    #[msg("Token does not exist in allocation")]
    TokenNotFound,

    #[msg("Allocation already has three tokens")]
    MaxTokensReached,
}
