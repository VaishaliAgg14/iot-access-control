const { ContractFactory, Provider, Wallet } = require("zksync-web3");
const HABACPolicy = require('../artifacts-zk/contracts/HABAC.sol/HABACPolicy.json');
const verifierArtifact = require('../artifacts-zk/contracts/verifier.sol/Groth16Verifier.json');
require("dotenv").config();

async function main() {
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PRIVATE_KEY) {
        throw new Error("Please set PRIVATE_KEY in your environment variables.");
    }

    // Initialize provider
    const provider = new Provider("https://sepolia.era.zksync.dev");
    console.log("Provider initialized:", provider);

    // Initialize wallet
    const wallet = new Wallet(PRIVATE_KEY, provider);
    console.log("Deploying with account:", wallet.address);

    try {
        // First deploy Verifier
        console.log("Deploying Verifier...");
        const verifierFactory = new ContractFactory(
            verifierArtifact.abi,
            verifierArtifact.bytecode,
            wallet
        );
        const verifier = await verifierFactory.deploy({
            customData: {
                feeToken: "0x0000000000000000000000000000000000000000"
            }
        });
        await verifier.deployed();
        console.log("Verifier deployed to:", verifier.address);

        // Then deploy HABAC
        console.log("Deploying HABACPolicy...");
        const habacFactory = new ContractFactory(
            HABACPolicy.abi,
            HABACPolicy.bytecode,
            wallet
        );
        const habac = await habacFactory.deploy(
            verifier.address,
            {
                customData: {
                    feeToken: "0x0000000000000000000000000000000000000000"
                }
            }
        );
        await habac.deployed();
        console.log("HABACPolicy deployed to:", habac.address);

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
