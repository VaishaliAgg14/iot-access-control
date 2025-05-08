const fs = require("fs");
const path = require("path");

// Number of policies to generate
const NUM_POLICIES = 500;
const policiesDir = path.join(__dirname, "../policies");

// Ensure the directory exists
if (!fs.existsSync(policiesDir)) {
    fs.mkdirSync(policiesDir);
}


// Generate unique policies
for (let i = 0; i < NUM_POLICIES; i++) {
    const policy = {
        policyId: `Policy-${i}`,
        owner: "Admin",
        allowedRoles: ["Manager", "Supervisor"],
        requiresZKP: true,
        conditions: {
            time: `08:00-18:00`,
            location: `Building ${i % 10}`,
            deviceTrustLevel: `${Math.floor(Math.random() * 5) + 1}`,
        },
    };

    fs.writeFileSync(
        path.join(policiesDir, `policy-${i}.json`),
        JSON.stringify(policy, null, 2)
    );
}

console.log(`✅ ${NUM_POLICIES} unique policy files generated in /policies`);
