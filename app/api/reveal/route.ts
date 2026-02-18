import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { supabase, BUCKETS } from "@/lib/supabase";
import { verifyUnlock } from "@/lib/verify";

export const dynamic = "force-dynamic";

const SIGNED_URL_EXPIRY = 600; // 10 минут

/**
 * GET /api/reveal?contentId=...&address=0x...&txHash=0x... (опционально)
 *
 * - contentId: UUID контента
 * - address: адрес плательщика (для проверки доступа)
 * - txHash: (опционально) hash транзакции unlockContent — при первом визите
 *
 * При повторном визите txHash не нужен — проверяем события по address.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");
    const address = searchParams.get("address");
    const txHash = searchParams.get("txHash") as `0x${string}` | null;

    if (!contentId || !address) {
      return NextResponse.json(
        { error: "Missing contentId or address" },
        { status: 400 }
      );
    }

    if (!isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid address" },
        { status: 400 }
      );
    }

    const unlocked = await verifyUnlock(
      address as `0x${string}`,
      contentId,
      txHash || undefined
    );

    if (!unlocked) {
      return NextResponse.json(
        { error: "Access denied. Payment not verified." },
        { status: 403 }
      );
    }

    const originalPath = `${contentId}.webp`;

    const { data, error } = await supabase.storage
      .from(BUCKETS.originals)
      .createSignedUrl(originalPath, SIGNED_URL_EXPIRY);

    if (error || !data?.signedUrl) {
      console.error("Signed URL error:", error);
      return NextResponse.json(
        { error: "Failed to generate access URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err) {
    console.error("Reveal error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
