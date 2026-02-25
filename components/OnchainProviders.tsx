"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base, baseSepolia, sepolia } from "viem/chains";

const chainName = process.env.NEXT_PUBLIC_CHAIN || "base";
const chain =
  chainName === "sepolia"
    ? sepolia
    : chainName === "baseSepolia"
      ? baseSepolia
      : base;

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
