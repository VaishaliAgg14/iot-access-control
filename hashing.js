const { ethers } = require("ethers");
const { Provider, Wallet } = require("zksync-web3");
const HABACPolicy = require('./artifacts-zk/contracts/HABAC.sol/HABACPolicy.json');
require("dotenv").config();

async function main() {
    const provider = new Provider("https://sepolia.era.zksync.dev");
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

    // Replace with your deployed contract address
    const habacPolicyAddress = "0x3Dc1af1438fbe934a7d2226C638D94e908F05a73";

    // Create contract instance with full ABI
    const habac = new ethers.Contract(
        habacPolicyAddress,
        HABACPolicy.abi,
        wallet
    );

    try {
        const startTimestamp = Date.now();
        for(let i=0;i<10;i++){
            const policy = `policy-${i}`;
            const policyId = ethers.keccak256(ethers.toUtf8Bytes(policy));
            console.log("Policy ID:", policyId);
    
            // Retrieve policy
            const storedPolicy = await habac.policies(policyId);
            // console.log("Stored Policy:", {
            //     ipfsCID: storedPolicy.ipfsCID,
            //     owner: storedPolicy.owner,
            //     requiresZKP: storedPolicy.requiresZKP
            // });
    
            // Calculate policy hash
            if (storedPolicy.ipfsCID) {
                const policyHash = ethers.keccak256(ethers.toUtf8Bytes(storedPolicy.ipfsCID));
                console.log("Policy Hash:", policyHash);
            }
        }
        const endTimestamp = Date.now();
        console.log("Time taken:", endTimestamp - startTimestamp, "ms");
        // Create policy ID hash
    } catch (error) {
        console.error("Error retrieving policy:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

