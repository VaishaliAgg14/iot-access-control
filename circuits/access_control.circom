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

    signal timeMatchIsZero;
    signal locationMatchIsZero;
    signal deviceMatchIsZero;

    // Compare each user attribute hash with the corresponding policy attribute hash
    timeMatch <== (timeHash - policyTimeHash) * (timeHash - policyTimeHash);
    locationMatch <== (locationHash - policyLocationHash) * (locationHash - policyLocationHash);
    deviceMatch <== (deviceTrustHash - policyDeviceTrustHash) * (deviceTrustHash - policyDeviceTrustHash);

    // Ensure each match is zero
    timeMatchIsZero <== 1 - timeMatch;
    locationMatchIsZero <== 1 - locationMatch;
    deviceMatchIsZero <== 1 - deviceMatch;

    signal intermediate;
    intermediate <== timeMatchIsZero * locationMatchIsZero;

    // Calculate overall validity
    isValid <== intermediate * deviceMatchIsZero;
}

component main = AccessControl();