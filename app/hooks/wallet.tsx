import { PublicKey } from "@solana/web3.js";
import { Wallet, WalletAccount, getWallets } from "@wallet-standard/core";
import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FallbackWallet, SupportedWallet, backpackIcon, phantomIcon, solflareIcon } from "@/app/utility/wallet";

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

export function useWallet(): UseWallet {
  return useContext(WalletContext);
}

const filterSupportedWallets = (wallets: ReadonlyArray<Wallet>): Array<SupportedWallet> => {
  return wallets
    .filter(wallet => Object.hasOwn(wallet.features, "standard:connect"))
    .filter(wallet => Object.hasOwn(wallet.features, "solana:signTransaction")) as Array<SupportedWallet>;
};

const { on, get } = getWallets();

export default function WalletProvider(props: PropsWithChildren): ReactElement {
  const [wallet, setWallet] = useState<SupportedWallet | null>(null);
  const [supportedWallets, setSupportedWallets] = useState(filterSupportedWallets(get()));

  useEffect(() => {
    const listeners = [
      on("register", (...wallets) => setSupportedWallets(current => [...current, ...filterSupportedWallets(wallets)])),
      on("unregister", (...wallets) => setSupportedWallets(current => current.filter(wallet => wallets.includes(wallet)))),
    ];
    return () => listeners.forEach(off => off());
  }, [setSupportedWallets]);

  const connect = useCallback(async (wallet: SupportedWallet) => {
    await wallet.features["standard:connect"].connect();
    setWallet(wallet);
  }, [setWallet]);

  const disconnect = useCallback(async () => {
    if (wallet == null) { return; }
    try {
      await wallet.features["standard:disconnect"]?.disconnect();
    } finally {
      setWallet(null);
    }
  }, [wallet, setWallet]);

  const account = useMemo(() => {
    if (wallet == null) { return null; }
    if (wallet.accounts.length === 0) { return null; }
    return wallet.accounts[0];
  }, [wallet]);

  const publicKey = useMemo(() => {
    if (account == null) { return null; }
    return new PublicKey(account.publicKey);
  }, [account]);

  const wallets = useMemo(() => {
    const fallbackWallets: SupportedWallet[] = [];
    const walletNames = new Set(supportedWallets.map(wallet => wallet.name));
    if (!walletNames.has("Phantom")) {
      fallbackWallets.push(new FallbackWallet("Get Phantom", phantomIcon, "https://www.phantom.app/"));
    }
    if (!walletNames.has("Solflare")) {
      fallbackWallets.push(new FallbackWallet("Get Solflare", solflareIcon, "https://solflare.com/"));
    }
    if (!walletNames.has("Backpack")) {
      fallbackWallets.push(new FallbackWallet("Get Backpack", backpackIcon, "https://backpack.app/"));
    }
    return [...supportedWallets, ...fallbackWallets];
  }, [supportedWallets]);

  const context = useMemo(() => ({
    wallets,
    wallet,
    account,
    publicKey,
    connect,
    disconnect,
  }), [wallets, wallet, account, publicKey, connect, disconnect]);

  return <WalletContext.Provider value={context}>{props.children}</WalletContext.Provider>;
}
