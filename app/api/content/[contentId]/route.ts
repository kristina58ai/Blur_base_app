import { NextResponse } from "next/server";
import { supabase, BUCKETS } from "@/lib/supabase";

/**
 * GET /api/content/[contentId]
 * Возвращает метаданные контента: creator, priceWei, blurredUrl
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const { contentId } = await params;

    const { data: metaFile } = await supabase.storage
      .from(BUCKETS.metadata)
      .download(`${contentId}.json`);

    if (!metaFile) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const text = await metaFile.text();
    const metadata = JSON.parse(text) as {
      creator: string;
      priceWei: string;
      createdAt?: string;
    };

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const blurredUrl = `${baseUrl}/storage/v1/object/public/${BUCKETS.blurred}/${contentId}.webp`;

    return NextResponse.json({
      creator: metadata.creator,
      priceWei: metadata.priceWei,
      blurredUrl,
      createdAt: metadata.createdAt,
    });
  } catch (err) {
    console.error("Content fetch error:", err);
    return NextResponse.json(
      { error: "Content not found" },
      { status: 404 }
    );
  }
}
