const { ethers } = require("ethers");
require("dotenv").config();
const HABACPolicy = require('../artifacts-zk/contracts/HABAC.sol/HABACPolicy.json');
const verifier = require('../artifacts-zk/contracts/verifier.sol/Groth16Verifier.json');
const {Provider , Wallet} = require("zksync-ethers");
const fs = require("fs");
const path = require("path");


async function main() {
    const provider = new Provider("https://sepolia.era.zksync.dev");
        const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
    // Replace with your deployed contract addresses
    const habacPolicyAddress = "0x3Dc1af1438fbe934a7d2226C638D94e908F05a73"; 
    const verifierAddress = "0xf8558abBcd2C8a7171cf2cF799121aA96d4335bD";

    // const habacPolicyABI = [
    //     "function verifyAccess(bytes32 _policyId,uint[2] calldata _pA,uint[2][2] calldata _pB,uint[2] calldata _pC,uint[1] calldata _pubSignals) public returns (bool) "
    // ];

    // const verifierABI = [
    //     "function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[1] calldata _pubSignals) public view returns (bool)"
    // ];

    const habacContract = new ethers.Contract(habacPolicyAddress, HABACPolicy.abi, wallet);
    const verifierContract = new ethers.Contract(verifierAddress, verifier.abi, wallet);

    // Replace with actual proof values from proof.json
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
            ethers.toBigInt("0x836d4d2e529aa4a7847561351541d18b4d5a2a595899bfcaeea604298a926bcd")
        ];
    
        const start =  Date.now();
    console.log("Verifying ZKP proof on zkSync Layer-2...");
    const proofValid = await verifierContract.verifyProof(
        formattedProof.pi_a,
        formattedProof.pi_b,
        formattedProof.pi_c,
        ["1"]
    );
    console.log("ZKP Proof Verified:", proofValid);
    // console.log("Gas Used in proof verification:" , proofValid.gasUsed.toString());

    if (!proofValid) {
        console.error("Proof verification failed.");
        return;
    }
    const end = Date.now();
    console.log("Proof verified in", end - start, "ms");


    console.log("Checking access control...");
    const start1 = Date.now();
    const accessResult = await habacContract.verifyAccess(
        ethers.keccak256(ethers.toUtf8Bytes("policy2")),
        formattedProof.pi_a,
        formattedProof.pi_b,
        formattedProof.pi_c,
        ["1"]
    );
    // console.log("Access Granted:", accessResult);
    const end1 = Date.now();
    console.log("Access verified in", end1 - start1, "ms");
    // console.log("Gas Used in access verification:" , accessResult.gasUsed.toString());
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
