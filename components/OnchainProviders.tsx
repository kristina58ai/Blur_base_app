"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { base, baseSepolia, sepolia } from "viem/chains";

// На продакшене (Vercel) всегда Ethereum Sepolia; иначе из env или default sepolia
const chainName =
  typeof window !== "undefined" &&
  (window.location.hostname === "blur-base-app.vercel.app" ||
    window.location.hostname.endsWith(".vercel.app"))
    ? "sepolia"
    : (process.env.NEXT_PUBLIC_CHAIN || "sepolia");
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
