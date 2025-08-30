import { ethers } from "hardhat";

async function main() {
  const EventManager = await ethers.getContractFactory("EventManager");
  console.log("Deploying EventManager to Lisk Sepolia...");

  const eventManager = await EventManager.deploy(
    process.env.PAYMENT_TOKEN_ADDRESS,
    process.env.TICKET_NFT_ADDRESS
  );

  await eventManager.deployed();

  console.log("EventManager deployed to:", eventManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
