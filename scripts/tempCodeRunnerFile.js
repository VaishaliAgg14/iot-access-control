const accessResult = await habacContract.verifyAccess(
            ethers.keccak256(ethers.toUtf8Bytes("policy2")),
            formattedProof.pi_a,
            formattedProof.pi_b,
            formattedProof.pi_c,
            ["1"]
        );
        // console.log("Access Granted:", accessResult);
        console.log("Access verified in", end1 - start1, "ms");