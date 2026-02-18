/**
 * BlurPay ABI и адрес контракта.
 * Адрес подставляется из NEXT_PUBLIC_BLUR_PAY_ADDRESS после деплоя.
 */

export const BLUR_PAY_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "payer", type: "address" },
      { indexed: false, name: "contentId", type: "string" },
    ],
    name: "ContentUnlocked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "contentId", type: "string" },
    ],
    name: "CreationFeePaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, name: "oldFee", type: "uint256" },
      { indexed: false, name: "newFee", type: "uint256" },
    ],
    name: "CreationFeeUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "previousOwner", type: "address" },
      { indexed: true, name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "creationFeeWei",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "contentId", type: "string" },
    ],
    name: "payCreationFee",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_feeWei", type: "uint256" },
    ],
    name: "setCreationFeeWei",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address payable", name: "creator", type: "address" },
      { internalType: "string", name: "contentId", type: "string" },
    ],
    name: "unlockContent",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const BLUR_PAY_ADDRESS =
  (process.env.NEXT_PUBLIC_BLUR_PAY_ADDRESS as `0x${string}`) ||
  ("0x0000000000000000000000000000000000000000" as `0x${string}`);
