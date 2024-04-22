# jewl

***Nothing in this document constitutes as tax or legal advice. Consult with a tax attourney before using the jewl platform.***

If you live in a country where capital gains are taxed at a lower tax rate than income (Canada...), you get heavily taxed on bonuses and equity allocations. If somehow you could turn your bonuses and equity allocations into something that resembles capital gains, you could save a lot of money.

Jewl is a platform that allows you to create specialized tokens that represent your bonuses and equity allocations (given they are also on-chain tokens). The way this works is simple:

Instead of receiving your bonuses and/or equity at set intervals you receive a special NFT on signing. This token initially has very little to no value given that it does not represent anything and is not backed by anything. You can create a new token using the `initializeAllocation` instruction.

We recomend that you initially add a small amount of value to this token by sending some other token to it. This will prevent the NFT from having no value. e.g. you could send 1 USDC to the token which gives the NFT a value of 1 USDC. On your tax return you then report this 1 USDC as income.

The jewl program allows the owner of the NFT to always exercise it for the tokens allocated to this NFT. This means that the NFT is always worth the value of the tokens allocated to it. To allocate more tokens to the NFT you can call the `increaseAllocation` instruction. This will increase the allocation of the NFT by the tokens specified.

At any time you can calculate the value of the NFT by summing the value of the tokens allocated to it. If at any point you'd like to exercise the NFT for the tokens allocated to it, you can do so by calling the `exerciseAllocation` instruction. Depending on the jurisdiction exercising the allocation might be considered a taxable employment benefit. In that instance you'd have to sell the NFT instead of exercising for it to be considered a capital gain.

If for some reason you'd like to decrease the allocation of the NFT (if you have set the `decreaseAuthority`), you can do so by calling the `decreaseAllocation` instruction. This will decrease the allocation of the NFT by the tokens specified.

The owner of the NFT is free to transfer the NFT to any wallet they'd like. This means that the owner of the NFT can transfer the NFT to another wallet or sell the allocation to a third party if they so wish. Transferring of the NFT can be done using the `transferAllocation` instruction. These special NFTs cannot be transferred directly because they are frozen to prevent accidental burning of the NFT (which would result in the loss of the tokens allocated to it).

## Example

Let's say you receive an equity allocation of 1000 X tokens every year. For simplicity, in this example the X token is always worth 10 USDC. If you were to receive this equity allocation yearly you would have to report 10,000 USDC as bonus income every year. If bonus income is taxed at 50% you would have to pay 5000 USDC in added taxes every year.

If you were to receive a jewl NFT instead on signing you would only have to report the value of the NFT as income (negligible). At the end of the year the 1000 X tokens would be assigned to the NFT increasing the value of the NFT to 10,000 USDC. If you were to exchange the NFT for the 1000 X tokens you would have to report the capital gains on the 10,000 USDC as income. If capital gains are taxed at 25% you would only have to pay 2500 USDC in added taxes, allowing you to retain 7500 USDC.

## Getting Started

* Install NodeJS and gcc-12 using `brew install node gcc@12`.
* Add gcc-12 headers to your cpath using `export CPATH="/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/usr/include"`.
* Install Rust lang using `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`.
* Install the Solana CLI using `curl -sSfL https://release.solana.com/stable/install | sh`.
* Add the Solana CLI to your path using `export PATH="/Users/$(whoami)/.local/share/solana/install/active_release/bin:$PATH"`.
* Install Anchor version manager using `cargo install --git https://github.com/coral-xyz/anchor avm --locked --force`.
* Install the latest Anchor version using `avm install latest && avm use latest`.
* Clone this repository using `git clone https://github.com/jewl-app/.github`.
* Install the dependencies using `yarn`.
* Set up a Solana wallet if you don't have one already (see below).
* Run one of the commands below to get started such as `yarn build`.

### Setting up a Solana wallet

* Create a new keypair using `solana-keygen new`.
* Check if you have a valid wallet address using `solana address`.
* Set your local config to the Solana devnet env using `solana config set --url https://api.devnet.solana.com`.
* Give yourself some SOL (for transaction fees) using `solana airdrop 1`.
* Check if you have a positive balance using `solana balance`.

## Components

This repository is split up into sevaral parts. The following is a (non-exhaustive) list of the components and their purpose.

* **On-Chain programs** - built with [Anchor](https://www.anchor-lang.com/) and runs on the [Solana](https://solana.com/) chain.
* **Off-Chain programs** - built with [Next.js](https://nextjs.org/) and runs on [Vercel](https://vercel.com/).

## Commands

There are a number of commands that can be run for either the on-chain or off-chain programs. All of them can (and should!) be addressed through yarn. You can run the commands using `yarn <command>`.

Below is a (non-exhaustive) list of available commands:
* **`yarn build`** - compile the components for deployment or serving.
* **`yarn start`** - start up the off-chain program through.
* **`yarn cli`** - start up the command line interface with useful tools.
* **`yarn test`** - run all tests for the on-chain or off-chain programs.
* **`yarn lint`** - run linter to check for bugs and code conventions.
* **`yarn fix`** - run linter to fix any bugs and enforce code conventions.
* **`yarn clean`** - clean up all local build products, useful for when builds are failing.

*Copyright © 2024 jewl*
