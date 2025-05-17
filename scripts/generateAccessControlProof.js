import fs from 'fs';
import { execSync } from 'child_process';
import { create } from 'ipfs-http-client';
import crypto from 'crypto';
import { ethers } from 'ethers';

// Initialize IPFS client
const ipfs = create({ host: '127.0.0.1', port: '5001', protocol: 'http' });
const deviceIdToCidMap = {
    'device-0': 'QmU1YyhVyeUqQLuEUTyN4dtkJHEtaNRgVS6NFvJEfkBHjd',
    'device-1': 'QmSaUCXdzzZFZfNXftY5rEDk9Ls2a26wYvKBQyuMM7VHE9',
    // Add more mappings as needed
};

// Function to hash data
function hashData(data) {
    const policyHash = ethers.keccak256(ethers.toUtf8Bytes(data));
    const hexHash = BigInt(policyHash).toString();
    return hexHash;
}

// Function to retrieve policy from IPFS
async function getPolicyFromIPFS(deviceId) {
    const cid = await getCidFromDeviceId(deviceId);
    const file = ipfs.cat(cid);
    let fileContent = '';

    for await (const chunk of file) {
        fileContent += new TextDecoder().decode(chunk);
    }

    console.log('Retrieved file content from IPFS:', fileContent); // Debugging line
    try {
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid JSON format retrieved from IPFS');
    }
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
    const policy = await getPolicyFromIPFS(deviceId);

    const inputJson = {
        timeHash: hashData(userAttributes.time),
        locationHash: hashData(userAttributes.location),
        deviceTrustHash: hashData(userAttributes.deviceTrust),
        policyTimeHash: hashData(policy.conditions.time),
        policyLocationHash: hashData(policy.conditions.location),
        policyDeviceTrustHash: hashData(policy.conditions.deviceTrustLevel)
    };

    fs.writeFileSync('circuits/input.json', JSON.stringify(inputJson, null, 2));
    console.log('input.json generated successfully.');
}

// Function to generate proof
function generateProof() {
    try {
        execSync('circom circuits/access_control.circom --r1cs --wasm --sym --c');
        execSync('snarkjs groth16 setup circuits/access_control.r1cs circuits/pot12_final.ptau circuits/access_control_0000.zkey');
        execSync('snarkjs zkey export verificationkey circuits/access_control_0000.zkey circuits/verification_key.json');
        execSync('node circuits/access_control_js/generate_witness.js circuits/access_control_js/access_control.wasm circuits/input.json circuits/witness.wtns');
        execSync('snarkjs groth16 prove circuits/access_control_0000.zkey circuits/witness.wtns circuits/proof.json circuits/public.json');
        console.log('Proof generated successfully.');
    } catch (error) {
        console.error('Error generating proof:', error);
    }
}

// Main function
async function main() {
    const userAttributes = {
        role: 'Manager',
        time: '08:00-18:00',
        location: 'Building 0',
        deviceTrust: '1'
    };
    const deviceId = 'device-0'; // Example device ID
    const startTime = Date.now();
    await generateInputJson(userAttributes, deviceId);
    generateProof();
    const endTime = Date.now();
    console.log(`Total time taken: ${endTime - startTime} ms`);
}

main().catch(console.error);