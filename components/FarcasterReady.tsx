"use client";

import { useEffect } from "react";

/**
 * Вызывает sdk.actions.ready() при загрузке приложения во Farcaster Mini App.
 * Убирает splash screen. Обязательно для корректного отображения в Warpcast.
 * @see https://miniapps.farcaster.xyz/docs/sdk/actions/ready
 */
export function FarcasterReady() {
  useEffect(() => {
    import("@farcaster/miniapp-sdk").then(({ sdk }) => {
      sdk.actions.ready();
    });
  }, []);
  return null;
}
