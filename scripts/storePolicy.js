const { ethers } = require("ethers");
const { Provider, Wallet, Contract } = require("zksync-web3");
require("dotenv").config();
const fs = require("fs");

async function main() {
    const provider = new Provider("https://sepolia.era.zksync.dev");
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Using account:", wallet.address);

    const habacPolicyAddress = "0x3Dc1af1438fbe934a7d2226C638D94e908F05a73";
    const habacPolicyABI = [
        "function storePolicyL2(bytes32 _policyId, string memory _ipfsCID, string memory _owner, string[] memory _allowedRoles, bool _requiresZKP) external payable"
    ];

    const contract = new Contract(habacPolicyAddress, habacPolicyABI, wallet);
    const policiesData = JSON.parse(fs.readFileSync("formatted-policies.json"));

    console.log("Processing policies...");
    let totalGasUsed = BigInt(0);

    // Process policies in batches
    console.log("Processing policies in batches...");
    const policies = [];
    const startTime = Date.now();

    // Create policies array with correct format
    for (let i = 0; i < 10; i++) {  // Start with 10 policies for testing
        const policyKey = `policy-${i}`;
        policies.push({
            policyId: ethers.keccak256(ethers.toUtf8Bytes(policyKey)),
            ipfsCID: policiesData[policyKey],
            owner: "Admin",
            allowedRoles: ["Manager", "Supervisor"],
            requiresZKP: true
        });
    }

    console.log(`Preparing to submit ${policies.length} policies...`);

    try {
        // Process each policy individually
        for (const policy of policies) {
            console.log(`Storing policy with CID: ${policy.ipfsCID}`);

            const tx = await contract.storePolicyL2(
                policy.policyId,
                policy.ipfsCID,
                policy.owner,
                policy.allowedRoles,
                policy.requiresZKP,
                {
                    value: ethers.parseEther("0.00007"),
                    gasLimit: 500000
                }
            );

            console.log(`Transaction submitted: ${tx.hash}`);
            const receipt = await tx.wait();
            totalGasUsed += BigInt(receipt.gasUsed.toString());

            console.log(`Transaction confirmed. Gas used: ${receipt.gasUsed.toString()}`);

            // Add delay between transactions
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const endTime = Date.now();
        console.log(`✅ ${policies.length} policies stored successfully!`);
        console.log("\nDeployment Summary:");
        console.log("==================");
        console.log("Total time taken:", (endTime - startTime) / 1000, "seconds");
        console.log("Total gas used:", totalGasUsed.toString());
    }catch (error) {
        console.error("Error during policy storage:", error);
        throw error;
    }
}


main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
