import type { Metadata } from "next";
import { OnchainProviders } from "@/components/OnchainProviders";
import "./globals.css";
import "@coinbase/onchainkit/styles.css";

export const metadata: Metadata = {
  title: "BlurPay - Pay to Reveal",
  description: "Pay-to-reveal image frames on Base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <OnchainProviders>{children}</OnchainProviders>
      </body>
    </html>
  );
}
