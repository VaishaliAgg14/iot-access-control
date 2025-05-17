const { ethers } = require("ethers");
const { Provider, Wallet, Contract } = require("zksync-web3");
require("dotenv").config();
const fs = require("fs");

async function storePolicy(policy, contract, nonce) {
    console.log(`Storing policy with CID: ${policy.ipfsCID}`);

    try {
        const tx = await contract.storePolicyL2(
            policy.policyId,
            policy.ipfsCID,
            policy.owner,
            policy.allowedRoles,
            policy.requiresZKP,
            {
                value: ethers.parseEther("0.000007"),
                gasLimit: 500000,
                nonce: nonce
            }
        );

        console.log(`Transaction submitted: ${tx.hash}`);
        const receipt = await tx.wait();
        console.log(`Transaction confirmed. Gas used: ${receipt.gasUsed.toString()}`);
        return BigInt(receipt.gasUsed.toString());
    } catch (error) {
        console.error("Error during policy storage:", error);
        return BigInt(0);
    }
}

async function storePoliciesSequentially(policies, contract) {
    console.log(`Preparing to submit ${policies.length} policies one by one...`);

    const startTime = Date.now();
    let totalGasUsed = BigInt(0);
    const wallet = new Wallet(process.env.PRIVATE_KEY, contract.provider);
    let currentNonce = await wallet.getTransactionCount();

    for (let i = 0; i < policies.length; i++) {
        const policy = policies[i];
        const gasUsed = await storePolicy(policy, contract, currentNonce);
        totalGasUsed += gasUsed;
        currentNonce += 1; // Increment nonce for the next transaction
    }

    const endTime = Date.now();

    console.log(`✅ ${policies.length} policies stored successfully one by one!`);
    console.log("\nDeployment Summary:");
    console.log("==================");
    console.log("Total time taken:", (endTime - startTime) / 1000, "seconds");
    console.log("Total gas used:", totalGasUsed.toString());
}

async function main() {
    const provider = new Provider("https://sepolia.era.zksync.dev");
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Using account:", wallet.address);

    const habacPolicyAddress = "0xF5dB6B948Ec2b3F70787d8Df9768b21412F42B4D";
    const habacPolicyABI = [
        "function storePolicyL2(bytes32 _policyId, string memory _ipfsCID, string memory _owner, string[] memory _allowedRoles, bool _requiresZKP) external payable"
    ];

    const contract = new Contract(habacPolicyAddress, habacPolicyABI, wallet);
    const policiesData = JSON.parse(fs.readFileSync("formatted-policies.json"));

    console.log("Processing policies...");
    const policies = [];

    for (let i = 0; i < 100; i++) {
        const policyKey = `policy-${i}`;
        policies.push({
            policyId: ethers.keccak256(ethers.toUtf8Bytes(policyKey)),
            ipfsCID: policiesData[policyKey],
            owner: "Admin",
            allowedRoles: ["Manager", "Supervisor"],
            requiresZKP: true
        });
    }

    await storePoliciesSequentially(policies, contract);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
