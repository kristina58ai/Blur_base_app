"use client";

import { useCallback, useState } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { Wallet, ConnectWallet, WalletDropdown } from "@coinbase/onchainkit/wallet";
import { useAccount } from "wagmi";
import { BLUR_PAY_ABI, BLUR_PAY_ADDRESS } from "@/lib/contract";
import { parseEther } from "viem";

// На продакшене (Vercel) всегда Ethereum Sepolia
const chainName =
  typeof window !== "undefined" &&
  (window.location.hostname === "blur-base-app.vercel.app" ||
    window.location.hostname.endsWith(".vercel.app"))
    ? "sepolia"
    : (process.env.NEXT_PUBLIC_CHAIN || "sepolia");
const CHAIN_ID =
  chainName === "sepolia" ? 11155111 : chainName === "baseSepolia" ? 84532 : 8453;

// Комиссия из контракта (~$1): 333000000000000 wei
const CREATION_FEE_WEI = 333000000000000n;

function generateContentId() {
  return crypto.randomUUID();
}

export function CreateFlow() {
  const { address } = useAccount();
  const [contentId, setContentId] = useState<string>("");
  const [priceEth, setPriceEth] = useState("0.001");
  const [step, setStep] = useState<"pay" | "upload" | "done">("pay");
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [frameUrl, setFrameUrl] = useState<string | null>(null);

  const initContentId = useCallback(() => {
    if (!contentId) setContentId(generateContentId());
  }, [contentId]);

  const handleStatus = useCallback(
    (status: LifecycleStatus) => {
      if (status.statusName === "success") {
        setStep("upload");
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !image || !contentId) return;

    setError(null);
    setUploading(true);

    try {
      const priceWei = (parseEther(priceEth)).toString();
      const formData = new FormData();
      formData.set("image", image);
      formData.set("contentId", contentId);
      formData.set("creator", address);
      formData.set("priceWei", priceWei);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFrameUrl(data.frameUrl);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <h2 className="text-xl font-semibold">Подключи кошелёк</h2>
        <Wallet>
          <ConnectWallet>
            <span className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Подключить кошелёк
            </span>
          </ConnectWallet>
        </Wallet>
      </div>
    );
  }

  if (step === "done" && frameUrl) {
    return (
      <div className="flex flex-col gap-4 rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-green-600">Контент создан</h2>
        <p className="text-sm text-gray-600">
          Поделись ссылкой во Farcaster:
        </p>
        <code className="break-all rounded bg-gray-100 px-2 py-1 text-sm">
          {frameUrl}
        </code>
        <button
          type="button"
          onClick={() => {
            setStep("pay");
            setContentId("");
            setImage(null);
            setFrameUrl(null);
          }}
          className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
        >
          Создать ещё
        </button>
      </div>
    );
  }

  if (step === "pay") {
    initContentId();

    const hasContract =
      BLUR_PAY_ADDRESS && BLUR_PAY_ADDRESS !== "0x0000000000000000000000000000000000000000";

    const calls = contentId && hasContract
      ? [
          {
            address: BLUR_PAY_ADDRESS,
            abi: BLUR_PAY_ABI,
            functionName: "payCreationFee" as const,
            args: [contentId],
            value: CREATION_FEE_WEI,
          },
        ]
      : [];

    return (
      <div className="flex flex-col gap-6 rounded-lg border p-6">
        <div>
          <h2 className="text-xl font-semibold">Шаг 1: Оплати комиссию $1</h2>
          <p className="mt-1 text-sm text-gray-600">
            Content ID: <code className="rounded bg-gray-100 px-1">{contentId || "..."}</code>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium">Цена за разблокировку (ETH)</label>
          <input
            type="text"
            value={priceEth}
            onChange={(e) => setPriceEth(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="0.001"
          />
        </div>

        {!hasContract && (
          <p className="rounded bg-amber-100 p-2 text-sm text-amber-800">
            Контракт не задеплоен. Задай NEXT_PUBLIC_BLUR_PAY_ADDRESS в .env.local
          </p>
        )}
        {calls.length > 0 && (
          <Transaction
            chainId={CHAIN_ID}
            calls={calls}
            onStatus={handleStatus}
          >
            <TransactionButton text="Оплатить $1" />
            <TransactionStatus>
              <TransactionStatusLabel />
            </TransactionStatus>
          </Transaction>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-lg border p-6">
      <h2 className="text-xl font-semibold">Шаг 2: Загрузи изображение</h2>
      <p className="text-sm text-gray-600">Content ID: {contentId}</p>

      <div>
        <label className="block text-sm font-medium">Изображение (JPEG, PNG, WebP, GIF, макс 5 MB)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm"
          required
        />
      </div>

      {error && (
        <p className="rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={!image || uploading}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Загрузка..." : "Создать"}
      </button>
    </form>
  );
}
