const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const fs = require("fs");
const policiesData = JSON.parse(fs.readFileSync("formatted-policies.json"));

// Load policies from a file or generate dummy policies
const policies = [];
for (let i = 0; i < 100; i++) {  
    // Adjust for 1000 or 5000 policies
    const policy = `policy-${i}`;
    const policyData = `Policy-${i}|${policiesData[policy]}|Admin|Manager,Supervisor|true`;
    policies.push(policyData);
}

// Convert policies into hashed leaves
const leaves = policies.map(policy => keccak256(policy));
const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

// Get Merkle Root
const merkleRoot = merkleTree.getRoot().toString("hex");

// Save Merkle root and tree for later use
fs.writeFileSync("merkleRoot.json", JSON.stringify({ merkleRoot }));
fs.writeFileSync("merkleTree.json", JSON.stringify(merkleTree));

console.log("✅ Merkle Root Generated:", merkleRoot);
