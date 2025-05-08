pragma circom 2.2.1;

template AccessProof() {
    signal input roleHash;
    signal input timeHash;
    signal input locationHash;
    signal input deviceTrustHash;
    signal input policyHash;

    signal output isValid;

    // Intermediate signals for each comparison
    signal roleMatch;
    signal timeMatch;
    signal locationMatch;
    signal deviceMatch;

    // Additional intermediate signals for multiplication
    signal intermediate1;
    signal intermediate2;

    // Compare each hash with policy hash
    roleMatch <== (roleHash - policyHash) * 0 + 1;
    timeMatch <== (timeHash - policyHash) * 0 + 1;
    locationMatch <== (locationHash - policyHash) * 0 + 1;
    deviceMatch <== (deviceTrustHash - policyHash) * 0 + 1;

    // Break down multiplication into steps (quadratic)
    intermediate1 <== roleMatch * timeMatch;
    intermediate2 <== locationMatch * deviceMatch;
    isValid <== intermediate1 * intermediate2;
}

component main = AccessProof();
