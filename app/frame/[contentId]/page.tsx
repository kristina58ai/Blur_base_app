import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RevealFrame } from "@/components/RevealFrame";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ contentId: string }>;
};

async function getMetadata(contentId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  const metaUrl = `${supabaseUrl}/storage/v1/object/public/metadata/${contentId}.json`;
  const blurredUrl = `${supabaseUrl}/storage/v1/object/public/blurred/${contentId}.webp`;

  try {
    const res = await fetch(metaUrl, { cache: "no-store" });
    if (!res.ok) return null;
    const meta = (await res.json()) as {
      creator: string;
      priceWei: string;
    };
    return { ...meta, blurredUrl };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { contentId } = await params;
  const meta = await getMetadata(contentId);
  if (!meta) return { title: "Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const priceEth = (Number(meta.priceWei) / 1e18).toFixed(4);

  return {
    title: `BlurPay — Reveal за ${priceEth} ETH`,
    description: "Pay to reveal",
    openGraph: {
      images: [meta.blurredUrl],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "1",
        imageUrl: meta.blurredUrl,
        button: {
          title: `Reveal за ${priceEth} ETH`,
          action: {
            type: "launch_frame",
            name: "BlurPay",
            url: `${baseUrl}/frame/${contentId}`,
            splashImageUrl: meta.blurredUrl,
            splashBackgroundColor: "#1a1a1a",
          },
        },
      }),
    },
  };
}

export default async function FramePage({ params }: Props) {
  const { contentId } = await params;
  const metadata = await getMetadata(contentId);

  if (!metadata) notFound();

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-lg">
        <RevealFrame contentId={contentId} metadata={metadata} />
      </div>
    </main>
  );
}
