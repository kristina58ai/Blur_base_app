import { NextResponse } from "next/server";

/** Размещённый манифест Farcaster (Mini App). При обновлении в кабинете Farcaster здесь подхватится автоматически. */
const HOSTED_MANIFEST_URL =
  "https://api.farcaster.xyz/miniapps/hosted-manifest/019c927a-1870-d983-fd06-de262e501d83";

/**
 * Farcaster Mini App manifest.
 * Доступен по /.well-known/farcaster.json через rewrite в next.config.js.
 * Отдаёт манифест с Farcaster, чтобы приложение проходило верификацию по домену.
 */
export async function GET() {
  try {
    const res = await fetch(HOSTED_MANIFEST_URL, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      throw new Error(`Farcaster manifest: ${res.status}`);
    }
    const manifest = await res.json();

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("Farcaster manifest fetch failed:", e);
    return NextResponse.json(
      { error: "Manifest unavailable" },
      { status: 502 }
    );
  }
}
