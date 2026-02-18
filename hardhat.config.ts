import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;
const accounts = deployerKey ? [deployerKey] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    baseSepolia: {
      url: process.env.BASE_RPC_URL || "https://sepolia.base.org",
      chainId: 84532,
      accounts,
    },
    base: {
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      chainId: 8453,
      accounts,
    },
  },
};

export default config;
