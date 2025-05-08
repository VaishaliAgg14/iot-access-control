// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./IZKVerifier.sol";
// import "@matterlabs/zksync-contracts/l1/contracts/zksync/IZkSync.sol";

// interface IZKVerifier {
//     function verifyProof(bytes calldata proof, bytes32 policyCID) external view returns (bool);
// }

contract HABACPolicy {
    IZKVerifier public zkVerifier;

    constructor(address _verifier) {
        zkVerifier = IZKVerifier(_verifier);
    }
    // address public zkVerifierContract;

    // constructor(address _zkVerifier) {
    //     zkVerifierContract = _zkVerifier;
    // }

    struct Policy {
        string ipfsCID; // Stores the IPFS Content Identifier for policy storage
        string owner; // Owner of the policy (Admin, Manager, etc.)
        string[] allowedRoles; // Roles that can access the resource
        bool requiresZKP; // Whether Zero-Knowledge Proof is required
    }

    mapping(bytes32 => Policy) public policies; // Mapping policy ID to Policy struct
    mapping(address => string) public userRoles; // Mapping user address to their role

    event PolicyStored(bytes32 indexed policyId, string ipfsCID);
    event AccessRequest(
        bytes32 indexed policyId,
        address requester,
        bool granted
    );

    function storePolicyL2(
        bytes32 _policyId,
        string memory _ipfsCID,
        string memory _owner,
        string[] memory _allowedRoles,
        bool _requiresZKP
    ) external payable {
        require(msg.value > 0, "Must send ETH for Layer-2 batch processing");

        policies[_policyId] = Policy(
            _ipfsCID,
            _owner,
            _allowedRoles,
            _requiresZKP
        );
        emit PolicyStored(_policyId, _ipfsCID);
    }

    function setUserRole(address _user, string memory _role) external {
        userRoles[_user] = _role;
    }

    function verifyAccess(
        bytes32 _policyId,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[1] calldata _pubSignals
    ) public returns (bool) {
        // Check if policy exists
        Policy storage policy = policies[_policyId];
        require(bytes(policy.owner).length > 0, "Policy not found!");
        require(policy.requiresZKP, "ZKP not required for this policy");

        // Verify the zero-knowledge proof
        bool isValid = zkVerifier.verifyProof(_pA, _pB, _pC, _pubSignals);
        require(isValid, "Access Denied: Invalid Proof");

        emit AccessRequest(_policyId, msg.sender, true);
        return true;
    }
}
