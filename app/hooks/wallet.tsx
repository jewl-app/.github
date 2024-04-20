import { PublicKey } from "@solana/web3.js";
import type { StandardConnectFeature, Wallet, WalletWithFeatures, StandardDisconnectFeature, WalletAccount } from "@wallet-standard/core";
import type { SolanaSignTransactionFeature } from "@solana/wallet-standard-features";
import { getWallets } from "@wallet-standard/core";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SupportedWallet = WalletWithFeatures<StandardConnectFeature & Partial<StandardDisconnectFeature> & SolanaSignTransactionFeature>;

export interface UseWallet {
  readonly wallets: Array<SupportedWallet>;
  readonly wallet: SupportedWallet | null;
  readonly account: WalletAccount | null;
  readonly publicKey: PublicKey | null;
  connect: (wallet: SupportedWallet) => Promise<void>;
  disconnect: () => Promise<void>;
}

export const WalletContext = createContext<UseWallet>({
  wallets: [],
  wallet: null,
  account: null,
  publicKey: null,
  connect: async () => Promise.reject(new Error("No provider")),
  disconnect: async () => Promise.reject(new Error("No provider")),
});

export function useWallet (): UseWallet {
  return useContext(WalletContext);
}

const filterSupportedWallets = (wallets: ReadonlyArray<Wallet>): Array<SupportedWallet> => {
  return wallets
    .filter(wallet => Object.hasOwn(wallet.features, "standard:connect"))
    .filter(wallet => Object.hasOwn(wallet.features, "solana:signTransaction")) as Array<SupportedWallet>;
};

const { on, get } = getWallets();

export default function WalletProvider (props: PropsWithChildren): ReactElement {
  const [selectedWallet, setSelectedWallet] = useState<SupportedWallet | null>(null);
  const [supportedWallets, setSupportedWallets] = useState(filterSupportedWallets(get()));

  useEffect(() => {
    const listeners = [
      on("register", (...wallets) => setSupportedWallets(current => [...current, ...filterSupportedWallets(wallets)])),
      on("unregister", (...wallets) => setSupportedWallets(current => current.filter(wallet => wallets.includes(wallet)))),
    ];
    return () => listeners.forEach(off => off());
  }, []);

  const connect = useCallback(async (wallet: SupportedWallet) => {
    await wallet.features["standard:connect"].connect();
    setSelectedWallet(wallet);
  }, [setSelectedWallet]);

  const disconnect = useCallback(async () => {
    if (selectedWallet == null) { return; }
    try {
      await selectedWallet.features["standard:disconnect"]?.disconnect();
    } finally {
      setSelectedWallet(null);
    }
  }, [selectedWallet, setSelectedWallet]);

  const account = useMemo(() => {
    if (selectedWallet == null) { return null; }
    if (selectedWallet.accounts.length === 0) { return null; }
    return selectedWallet.accounts[0];
  }, [selectedWallet]);

  const publicKey = useMemo(() => {
    if (account == null) { return null; }
    return new PublicKey(account.publicKey);
  }, [account]);

  const context = useMemo(() => ({
    wallets: supportedWallets,
    wallet: selectedWallet,
    account,
    publicKey,
    connect,
    disconnect,
  }), [supportedWallets, selectedWallet, account, publicKey, connect, disconnect]);

  return <WalletContext.Provider value={context}>{props.children}</WalletContext.Provider>;
}
