"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base, baseSepolia } from "viem/chains";

const chain =
  process.env.NEXT_PUBLIC_CHAIN === "baseSepolia" ? baseSepolia : base;

export function OnchainProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnchainKitProvider chain={chain}>
      {children}
    </OnchainKitProvider>
  );
}
