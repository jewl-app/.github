"use client";
import type { ReactElement } from "react";
import React from "react";
import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import Provider from "@/app/components/provider";
import TransactionProvider from "@/app/hooks/transaction";
import AnalyticsProvider from "@/app/hooks/analytics";
import PopupProvider from "@/app/hooks/popup";
import ClusterProvider from "@/app/hooks/cluster";
import WalletProvider from "@/app/hooks/wallet";
import ConnectionProvider from "@/app/hooks/connection";
import BalanceProvider from "@/app/hooks/balance";
import TokensProvider from "@/app/hooks/tokens";
import Content from "@/app/components/content";
import FeeConfigProvider from "@/app/hooks/fee";

const providers = [
  AnalyticsProvider, ConnectionProvider,
  ClusterProvider, WalletProvider, BalanceProvider,
  FeeConfigProvider, TokensProvider, TransactionProvider,
  PopupProvider,
];

export default function Page(): ReactElement {
  return (
    <Provider providers={providers}>
      <Header />
      <Content />
      <Footer />
    </Provider>
  );
}
