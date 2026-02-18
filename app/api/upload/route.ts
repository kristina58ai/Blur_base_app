import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAddress } from "viem";
import { supabase, BUCKETS } from "@/lib/supabase";
import { verifyCreationFee } from "@/lib/verify";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const contentId = formData.get("contentId") as string | null;
    const creator = formData.get("creator") as string | null;
    const priceWei = formData.get("priceWei") as string | null;

    if (!image || !contentId || !creator || !priceWei) {
      return NextResponse.json(
        { error: "Missing: image, contentId, creator, priceWei" },
        { status: 400 }
      );
    }

    // Валидация contentId (UUID формат)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(contentId)) {
      return NextResponse.json(
        { error: "Invalid contentId (expected UUID)" },
        { status: 400 }
      );
    }

    // Валидация creator
    if (!isAddress(creator)) {
      return NextResponse.json(
        { error: "Invalid creator address" },
        { status: 400 }
      );
    }

    // Валидация цены
    const price = BigInt(priceWei);
    if (price <= 0n) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    // Валидация файла
    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json(
        { error: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5 MB" },
        { status: 400 }
      );
    }

    // Проверка оплаты комиссии в блокчейне
    const paid = await verifyCreationFee(creator as `0x${string}`, contentId);
    if (!paid) {
      return NextResponse.json(
        {
          error:
            "Creation fee not paid. Call payCreationFee(contentId) first.",
        },
        { status: 402 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());

    // Размытие через sharp
    const blurredBuffer = await sharp(buffer)
      .blur(15)
      .webp({ quality: 80 })
      .toBuffer();

    // Оригинал в WebP
    const originalBuffer = await sharp(buffer)
      .webp({ quality: 90 })
      .toBuffer();

    const blurredPath = `${contentId}.webp`;
    const originalPath = `${contentId}.webp`;
    const metadataPath = `${contentId}.json`;

    // Загрузка в Storage
    const [blurredRes, originalRes] = await Promise.all([
      supabase.storage
        .from(BUCKETS.blurred)
        .upload(blurredPath, blurredBuffer, {
          contentType: "image/webp",
          upsert: true,
        }),
      supabase.storage
        .from(BUCKETS.originals)
        .upload(originalPath, originalBuffer, {
          contentType: "image/webp",
          upsert: true,
        }),
    ]);

    if (blurredRes.error || originalRes.error) {
      console.error("Storage upload error:", blurredRes.error || originalRes.error);
      return NextResponse.json(
        { error: "Failed to upload to storage" },
        { status: 500 }
      );
    }

    // Metadata JSON
    const metadata = {
      creator,
      priceWei: priceWei,
      createdAt: new Date().toISOString(),
    };

    const { error: metaError } = await supabase.storage
      .from(BUCKETS.metadata)
      .upload(metadataPath, JSON.stringify(metadata), {
        contentType: "application/json",
        upsert: true,
      });

    if (metaError) {
      console.error("Metadata upload error:", metaError);
      // Не критично — blurred и original уже загружены
    }

    // Публичный URL размытой картинки
    const {
      data: { publicUrl: blurredUrl },
    } = supabase.storage.from(BUCKETS.blurred).getPublicUrl(blurredPath);

    return NextResponse.json({
      contentId,
      blurredUrl,
      frameUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/frame/${contentId}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
