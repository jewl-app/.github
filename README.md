# jewl

We welcome [contributions](https://github.com/jewl-app/.github/blob/main/CONTRIBUTING.md) from the community and encourage developers to explore our codebase, create new features, and build on top of our platform.

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
