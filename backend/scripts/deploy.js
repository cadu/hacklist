const { ethers } = require("hardhat");

async function main() {
  // Get contract factory
  const hackListContract = await ethers.getContractFactory("HackList");
  // Create a transaction to deploy the contract passing as parameter the limit number of hackers in the Hackathon
  const deployedContract = await hackListContract.deploy(10);
  // Wait for the contract to be mined
  await deployedContract.deployed();

  // Contract deployed, log the address to the console
  console.log("HackList Contract Address:", deployedContract.address);
}

// Call the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });