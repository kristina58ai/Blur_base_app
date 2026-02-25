"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
} from "@coinbase/onchainkit/transaction";
import type { LifecycleStatus } from "@coinbase/onchainkit/transaction";
import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { BLUR_PAY_ABI, BLUR_PAY_ADDRESS } from "@/lib/contract";

// Только Ethereum Sepolia (chainId 11155111)
const CHAIN_ID = 11155111;
const SEPOLIA_CHAIN_ID = 11155111;

type ContentMeta = {
  creator: string;
  priceWei: string;
  blurredUrl: string;
};

type Props = {
  contentId: string;
  metadata: ContentMeta;
};

export function RevealFrame({ contentId, metadata }: Props) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const switchToSepolia = useCallback(async () => {
    setTxError(null);
    try {
      await switchChainAsync?.({ chainId: SEPOLIA_CHAIN_ID });
    } catch {
      setTxError(
        "Не удалось переключить сеть. Вручную выберите Ethereum Sepolia в кошельке."
      );
    }
  }, [switchChainAsync]);

  const isWrongChain =
    chainId !== undefined && chainId !== SEPOLIA_CHAIN_ID;

  const fetchReveal = useCallback(
    async (txHash?: string) => {
      if (!address) return null;
      const params = new URLSearchParams({
        contentId,
        address,
        ...(txHash && { txHash }),
      });
      const res = await fetch(`/api/reveal?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.signedUrl as string;
    },
    [contentId, address]
  );

  useEffect(() => {
    if (!address) return;
    setChecking(true);
    fetchReveal()
      .then((url) => {
        if (url) setSignedUrl(url);
      })
      .finally(() => setChecking(false));
  }, [address, fetchReveal]);

  const handleStatus = useCallback(
    async (status: LifecycleStatus) => {
      setTxError(null);
      if (status.statusName === "success" && status.statusData?.transactionReceipts?.[0]) {
        const txHash = status.statusData.transactionReceipts[0].transactionHash;
        const url = await fetchReveal(txHash);
        if (url) setSignedUrl(url);
      }
      if (status.statusName === "error") {
        setTxError(
          "Переключите кошелёк на сеть Ethereum Sepolia и попробуйте снова."
        );
      }
    },
    [fetchReveal]
  );

  const hasContract =
    BLUR_PAY_ADDRESS && BLUR_PAY_ADDRESS !== "0x0000000000000000000000000000000000000000";

  const calls =
    hasContract && metadata.creator
      ? [
          {
            address: BLUR_PAY_ADDRESS,
            abi: BLUR_PAY_ABI,
            functionName: "unlockContent" as const,
            args: [metadata.creator as `0x${string}`, contentId],
            value: BigInt(metadata.priceWei),
          },
        ]
      : [];

  const priceEth = (Number(metadata.priceWei) / 1e18).toFixed(4);

  if (!address) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-6">
        <img
          src={metadata.blurredUrl}
          alt="Blurred"
          className="max-h-[300px] rounded object-cover"
        />
        <p className="text-sm text-gray-600">Подключи кошелёк, чтобы открыть</p>
        <Wallet>
          <ConnectWallet>
            <span className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Подключить
            </span>
          </ConnectWallet>
        </Wallet>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <p className="text-gray-600">Проверка доступа...</p>
      </div>
    );
  }

  if (signedUrl) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <p className="text-sm font-medium text-green-600">Разблокировано</p>
        <img
          src={signedUrl}
          alt="Revealed"
          className="max-h-[500px] max-w-full rounded object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <img
        src={metadata.blurredUrl}
        alt="Blurred"
        className="max-h-[300px] rounded object-cover"
      />
      <p className="text-center text-sm text-gray-600">
        Reveal за {priceEth} ETH
      </p>
      {isWrongChain && (
        <div className="w-full max-w-md rounded-lg border-2 border-amber-500 bg-amber-50 p-4">
          <p className="mb-2 font-medium text-amber-900">
            Нужна сеть Ethereum Sepolia
          </p>
          <p className="mb-3 text-sm text-amber-800">
            Переключите кошелёк на Ethereum Sepolia для оплаты.
          </p>
          <button
            type="button"
            onClick={switchToSepolia}
            className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
          >
            Переключить на Ethereum Sepolia
          </button>
        </div>
      )}
      {txError && (
        <p className="w-full max-w-md rounded bg-red-100 p-2 text-center text-sm text-red-700">
          {txError}
        </p>
      )}
      {calls.length > 0 && !isWrongChain && (
        <Transaction chainId={CHAIN_ID} calls={calls} onStatus={handleStatus}>
          <TransactionButton text={`Reveal за ${priceEth} ETH`} />
          <TransactionStatus>
            <TransactionStatusLabel />
          </TransactionStatus>
        </Transaction>
      )}
      {!hasContract && (
        <p className="text-sm text-amber-600">Контракт не настроен</p>
      )}
    </div>
  );
}
