const { ethers } = require("ethers");
require("dotenv").config();
const HABACPolicy = require('../artifacts-zk/contracts/HABAC.sol/HABACPolicy.json');
const verifier = require('../artifacts-zk/contracts/verifier.sol/Groth16Verifier.json');
const { Provider, Wallet } = require("zksync-ethers");
const fs = require("fs");
const path = require("path");

async function verifyAccessRequest(index, nonce) {
    const provider = new Provider("https://sepolia.era.zksync.dev");
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    const habacPolicyAddress = "0xF5dB6B948Ec2b3F70787d8Df9768b21412F42B4D";
    const verifierAddress = "0x652036Fc0A2a8fed614ECdA91a42FEFB2F47f81c";

    const habacContract = new ethers.Contract(habacPolicyAddress, HABACPolicy.abi, wallet);
    const verifierContract = new ethers.Contract(verifierAddress, verifier.abi, wallet);

    const proofPath = path.join(__dirname, "..", "circuits", "proof.json");
    const proof = JSON.parse(fs.readFileSync(proofPath, "utf-8"));

    const formattedProof = {
        pi_a: proof.pi_a.slice(0, 2),
        pi_b: [
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]]
        ],
        pi_c: proof.pi_c.slice(0, 2),
    };

    console.log(`Verifying ZKP proof for request ${index} on zkSync Layer-2...`);
    const proofValid = await verifierContract.verifyProof(
        formattedProof.pi_a,
        formattedProof.pi_b,
        formattedProof.pi_c,
        ["1"]
    );

    if (!proofValid) {
        console.error(`Proof verification failed for request ${index}.`);
        return { success: false, gasUsed: 0 };
    }

    console.log(`Checking access control for request ${index}...`);
    const tx = await habacContract.verifyAccess(
        ethers.keccak256(ethers.toUtf8Bytes(`policy-${index}`)),
        formattedProof.pi_a,
        formattedProof.pi_b,
        formattedProof.pi_c,
        ["1"],
        { nonce: nonce }
    );

    const receipt = await tx.wait();
    console.log(`Access Granted for request ${index}:`, receipt.status === 1);
    return { success: receipt.status === 1, gasUsed: BigInt(receipt.gasUsed.toString()) };
}

async function main() {
    const provider = new Provider("https://sepolia.era.zksync.dev");
    const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    const startTime = Date.now();
    let nonce = await provider.getTransactionCount(wallet.address);

    const requests = Array.from({ length: 50 }, (_, i) => verifyAccessRequest(i, nonce + i));
    const results = await Promise.all(requests);

    let totalGasUsed = BigInt(0);
    results.forEach((result, index) => {
        console.log(`Request ${index} result:`, result.success ? "Access Granted" : "Access Denied", `Gas Used: ${result.gasUsed}`);
        totalGasUsed += result.gasUsed;
    });

    const endTime = Date.now();
    console.log(`Total time for 50 requests: ${endTime - startTime} ms`);
    console.log(`Total gas used for 50 requests: ${totalGasUsed.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});