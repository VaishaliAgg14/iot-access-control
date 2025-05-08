// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract HABACPolicy2 {
    bytes32 public policyMerkleRoot;

    // event MerkleRootUpdated(bytes32 newMerkleRoot);

    // function storePolicyMerkleRoot(bytes32 _merkleRoot) external {
    //     policyMerkleRoot = _merkleRoot;
    //     emit MerkleRootUpdated(_merkleRoot);
    // }

    // function verifyPolicy(bytes32 _leaf, bytes32[] memory _proof) public view returns (bool) {
    //     return verifyMerkleProof(_proof, policyMerkleRoot, _leaf);
    // }

    // function verifyMerkleProof(
    //     bytes32[] memory _proof,
    //     bytes32 _root,
    //     bytes32 _leaf
    // ) internal pure returns (bool) {
    //     bytes32 computedHash = _leaf;
    //     for (uint256 i = 0; i < _proof.length; i++) {
    //         computedHash = keccak256(abi.encodePacked(computedHash, _proof[i]));
    //     }
    //     return computedHash == _root;
    // }
}
