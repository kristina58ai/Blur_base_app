"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { sepolia } from "viem/chains";

// Только Ethereum Sepolia
const chain = sepolia;

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
