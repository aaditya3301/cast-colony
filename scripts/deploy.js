const hre = require("hardhat");

async function main() {
  console.log("Deploying Cast Colony contracts to", hre.network.name);

  // Deploy GEMS Token
  console.log("Deploying GemsToken...");
  const GemsToken = await hre.ethers.getContractFactory("GemsToken");
  const gemsToken = await GemsToken.deploy();
  await gemsToken.waitForDeployment();
  
  const gemsTokenAddress = await gemsToken.getAddress();
  console.log("GemsToken deployed to:", gemsTokenAddress);

  // Deploy Game Contract
  console.log("Deploying CastColonyGame...");
  const CastColonyGame = await hre.ethers.getContractFactory("CastColonyGame");
  const gameContract = await CastColonyGame.deploy(gemsTokenAddress);
  await gameContract.waitForDeployment();
  
  const gameContractAddress = await gameContract.getAddress();
  console.log("CastColonyGame deployed to:", gameContractAddress);

  // Transfer ownership of GEMS token to game contract
  console.log("Transferring GemsToken ownership to game contract...");
  await gemsToken.transferOwnership(gameContractAddress);
  console.log("Ownership transferred!");

  // Output addresses for frontend
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Network:", hre.network.name);
  console.log("GEMS Token:", gemsTokenAddress);
  console.log("Game Contract:", gameContractAddress);
  
  console.log("\nUpdate your addresses.js file with:");
  console.log(`GEMS_TOKEN: "${gemsTokenAddress}",`);
  console.log(`GAME_CONTRACT: "${gameContractAddress}",`);

  // Verify contracts if not on localhost
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await gemsToken.deploymentTransaction().wait(5);
    await gameContract.deploymentTransaction().wait(5);

    console.log("Verifying contracts...");
    try {
      await hre.run("verify:verify", {
        address: gemsTokenAddress,
        constructorArguments: [],
      });
      console.log("GemsToken verified!");
    } catch (error) {
      console.log("GemsToken verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: gameContractAddress,
        constructorArguments: [gemsTokenAddress],
      });
      console.log("CastColonyGame verified!");
    } catch (error) {
      console.log("CastColonyGame verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });