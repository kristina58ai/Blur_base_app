import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { BLUR_PAY_ABI, BLUR_PAY_ADDRESS } from "./contract";

// Только Ethereum Sepolia
const chain = sepolia;
const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

const client = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

/**
 * Проверяет, оплатил ли creator комиссию за contentId (событие CreationFeePaid)
 */
export async function verifyCreationFee(
  creatorAddress: `0x${string}`,
  contentId: string
): Promise<boolean> {
  if (
    !BLUR_PAY_ADDRESS ||
    BLUR_PAY_ADDRESS === "0x0000000000000000000000000000000000000000"
  ) {
    return false;
  }

  const logs = await client.getContractEvents({
    address: BLUR_PAY_ADDRESS,
    abi: BLUR_PAY_ABI,
    eventName: "CreationFeePaid",
    args: { creator: creatorAddress },
  });

  return logs.some((log) => log.args.contentId === contentId);
}

/**
 * Проверяет, разблокировал ли payer контент contentId (событие ContentUnlocked)
 */
export async function verifyUnlock(
  payerAddress: `0x${string}`,
  contentId: string,
  txHash?: `0x${string}`
): Promise<boolean> {
  if (
    !BLUR_PAY_ADDRESS ||
    BLUR_PAY_ADDRESS === "0x0000000000000000000000000000000000000000"
  ) {
    return false;
  }

  if (txHash) {
    const receipt = await client.getTransactionReceipt({ hash: txHash });
    if (!receipt || receipt.status !== "success") return false;
  }

  const logs = await client.getContractEvents({
    address: BLUR_PAY_ADDRESS,
    abi: BLUR_PAY_ABI,
    eventName: "ContentUnlocked",
    args: { payer: payerAddress },
  });

  return logs.some((log) => log.args.contentId === contentId);
}
