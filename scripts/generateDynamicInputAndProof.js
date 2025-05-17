const fs = require('fs');
const { execSync } = require('child_process');
const ipfsClient = require('ipfs-http-client');
const crypto = require('crypto');

// Initialize IPFS client
const ipfs = ipfsClient.create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });

// Example mapping of device IDs to CIDs
const deviceIdToCidMap = {
    'device-0': 'QmU1YyhVyeUqQLuEUTyN4dtkJHEtaNRgVS6NFvJEfkBHjd',
    'device-1': 'QmSaUCXdzzZFZfNXftY5rEDk9Ls2a26wYvKBQyuMM7VHE9',
    // Add more mappings as needed
};

// Function to hash user attributes
function hashAttributes(attributes) {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(attributes));
    return hash.digest('hex');
}

// Function to retrieve policy hash from IPFS
async function getPolicyHashFromIPFS(deviceId) {
    // Assuming deviceId is used to get the CID from a mapping
    const cid = await getCidFromDeviceId(deviceId);
    const file = await ipfs.cat(cid);
    return file.toString();
}

// Placeholder function to get CID from device ID
async function getCidFromDeviceId(deviceId) {
    // Fetch CID from the mapping
    const cid = deviceIdToCidMap[deviceId];
    if (!cid) {
        throw new Error(`CID not found for device ID: ${deviceId}`);
    }
    return cid;
}

// Function to generate input.json
async function generateInputJson(userAttributes, deviceId) {
    const userHash = hashAttributes(userAttributes);
    const policyHash = await getPolicyHashFromIPFS(deviceId);

    const inputJson = {
        userHash,
        policyHash
    };

    fs.writeFileSync('input.json', JSON.stringify(inputJson, null, 2));
    console.log('input.json generated successfully.');
}

// Function to generate proof
function generateProof() {
    try {
        execSync('circom circuit.circom --r1cs --wasm --sym --c');
        execSync('snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey');
        execSync('snarkjs zkey export verificationkey circuit_0000.zkey verification_key.json');
        execSync('snarkjs groth16 prove circuit_0000.zkey input.json proof.json public.json');
        console.log('Proof generated successfully.');
    } catch (error) {
        console.error('Error generating proof:', error);
    }
}

// Main function
async function main() {
    const userAttributes = { /* User attributes go here */ };
    const deviceId = 'device123'; // Example device ID

    await generateInputJson(userAttributes, deviceId);
    generateProof();
}

main().catch(console.error);