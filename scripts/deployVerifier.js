const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy Verifier first
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    const deployedADDRESS = await verifier.getAddress();
    console.log("Verifier deployed to:", deployedADDRESS);

    // Deploy HABAC with verifier address
    const HABAC = await ethers.getContractFactory("HABACPolicy");
    const habac = await HABAC.deploy(deployedADDRESS);
    await habac.waitForDeployment();
    const deployedADDRESS2 = await habac.getAddress();
    console.log("HABACPolicy deployed to:", deployedADDRESS2);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
