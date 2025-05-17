pragma circom 2.2.1;

// Template for Access Control Proof
template AccessControl() {
    signal input timeHash;
    signal input locationHash;
    signal input deviceTrustHash;
    signal input policyTimeHash;
    signal input policyLocationHash;
    signal input policyDeviceTrustHash;

    signal output isValid;

    // Intermediate signals for each comparison
    signal timeMatch;
    signal locationMatch;
    signal deviceMatch;

    // Compare each user attribute hash with the corresponding policy attribute hash
    timeMatch <== (timeHash == policyTimeHash);
    locationMatch <== (locationHash == policyLocationHash);
    deviceMatch <== (deviceTrustHash == policyDeviceTrustHash);

    signal intermediate2;

    intermediate2 <== locationMatch * deviceMatch;

    // Calculate overall validity
    isValid <== timeMatch * intermediate2;
}

component main = AccessControl();