import { NextResponse } from "next/server";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

/**
 * Farcaster Mini App manifest.
 * Доступен по /.well-known/farcaster.json через rewrite.
 *
 * accountAssociation: сгенерировать через https://farcaster.xyz/~/developers/new
 * и добавить в env FARCASTER_ACCOUNT_ASSOCIATION (JSON string) или оставить null.
 */
export async function GET() {
  const accountAssociation = process.env.FARCASTER_ACCOUNT_ASSOCIATION
    ? (JSON.parse(process.env.FARCASTER_ACCOUNT_ASSOCIATION) as object)
    : undefined;

  const manifest = {
    ...(accountAssociation && { accountAssociation }),
    miniapp: {
      version: "1",
      name: "BlurPay",
      homeUrl: baseUrl,
      iconUrl: `${baseUrl}/icon.png`,
      splashImageUrl: `${baseUrl}/icon.png`,
      splashBackgroundColor: "#0a0a0a",
      subtitle: "Pay-to-reveal на Base",
      description:
        "Загружай изображения, размывай и продавай доступ. Покупатели платят за reveal.",
      primaryCategory: "art-creativity",
      tags: ["pay-to-reveal", "base", "images"],
      requiredChains: [
        process.env.NEXT_PUBLIC_CHAIN === "baseSepolia"
          ? "eip155:84532"
          : "eip155:8453",
      ],
      requiredCapabilities: ["wallet.getEthereumProvider"],
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
