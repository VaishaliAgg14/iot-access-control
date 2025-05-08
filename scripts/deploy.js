const { ethers } = require("hardhat");

async function main() {
  // Deploy the contract
  const deployedADDRESS ="0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";
    const habac = await ethers.getContractAt("HABACPolicy", deployedADDRESS);
  // Test policy creation
  const startTime = Date.now();

  const policyId = ethers.keccak256(ethers.toUtf8Bytes("0x123")); // Updated method
  const ipfsCID = "QmeK7Ni7CT7bgHEo2qLuph6cdgsndiPMnirCgKY8M7MXUF";
  const owner = "Admin";
  const allowedRoles = ["Manager", "Supervisor"];
  const requiresZKP =true;

  const endTime = Date.now();


  try {
    const tx = await habac.storePolicy(
      policyId,
      ipfsCID,
      owner,
      allowedRoles,
      requiresZKP
    );
    const receipt = await tx.wait();
    console.log("Gas Used for Storing Policy:", receipt.gasUsed.toString());
    console.log("Time Taken for Storing Policy:", (endTime - startTime), "ms");
    console.log("Policy stored successfully");

    // Test access verification
    // const result = await habac.verifyAccess(
    //   policyId,
    //   "Manager",
    //   "9AM-5PM",
    //   "Office_Network",
    //   "High"
    // );
    // console.log("Access verification result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });