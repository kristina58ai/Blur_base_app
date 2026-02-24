import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying BlurPay with account:", deployer.address);

  const BlurPay = await hre.ethers.getContractFactory("BlurPay");
  const contract = await BlurPay.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("BlurPay deployed to:", address);
  console.log("Owner:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
