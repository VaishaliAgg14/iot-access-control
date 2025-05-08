const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // Load the proof from proof.json
    const proofPath = path.join(__dirname, "..", "circuits", "proof.json");
    const proof = JSON.parse(fs.readFileSync(proofPath, "utf-8"));

    // Format the proof for the verifier contract
    const formattedProof = {
        pi_a: proof.pi_a.slice(0, 2), // Remove the last element (1)
        pi_b: [                        // Reverse inner arrays for Solidity
            [proof.pi_b[0][1], proof.pi_b[0][0]],
            [proof.pi_b[1][1], proof.pi_b[1][0]]
        ],
        pi_c: proof.pi_c.slice(0, 2), // Remove the last element (1)
    };

    const publicInputs = [
        // This should match the policy hash from your input.json
        ethers.toBigInt("0xe92b0369a40303e06c831a780ee0134c44956fec5dd60d991478dd024d2d5e43")
    ];

    // Get the deployed verifier contract
    const verifier = await ethers.getContractAt(
        "Groth16Verifier",
        "0x5fbdb2315678afecb367f032d93f642f64180aa3" // Replace with actual address
    );

    try {
        // Call verifyProof

        const result = await verifier.verifyProof(
            formattedProof.pi_a,
            formattedProof.pi_b,
            formattedProof.pi_c,
            ["1"] // Replace with your actual public inputs
        );

        console.log("Proof verification result:", result);
    } catch (error) {
        console.error("Error verifying proof:", error);
    }

    const habac = await ethers.getContractAt(
        "HABACPolicy",
        "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512" // Replace with actual address
    );

    try {
        // Verify access with ZKP
        const startTime = Date.now();
        const accessTx = await habac.verifyAccess(
            ethers.keccak256(ethers.toUtf8Bytes("policy-0")), // policy ID
            formattedProof.pi_a,
            formattedProof.pi_b,
            formattedProof.pi_c,
            ["1"] // Replace with your actual public inputs
        );
        const accessReceipt = await accessTx.wait();
        const endTime = Date.now();
        console.log("Time Taken for Access Verification:", (endTime - startTime), "ms");
        console.log("Gas Used for Access Verification:", accessReceipt.gasUsed.toString());

    } catch (error) {
        console.error("Error verifying with HABAC:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });