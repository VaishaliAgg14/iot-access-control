const fs = require('fs');

// Read the raw policy file
const input = fs.readFileSync('policy.json', 'utf8');
const lines = input.split('\n').filter(line => line.trim());

// Create policies object
const policies = {};

// Process each line
lines.forEach(line => {
    const parts = line.trim().split(' ');
    if (parts.length === 2) {
        const cid = parts[0];
        const policyPath = parts[1];
        const policyNumber = policyPath.match(/policy-(\d+)\.json/);

        if (policyNumber && policyNumber[1]) {
            policies[`policy-${policyNumber[1]}`] = cid;
        }
    }
});

// Sort policies by number
const sortedPolicies = Object.fromEntries(
    Object.entries(policies).sort((a, b) => {
        const numA = parseInt(a[0].split('-')[1]);
        const numB = parseInt(b[0].split('-')[1]);
        return numA - numB;
    })
);

// Create final JSON structure
const output = {sortedPolicies};

// Write to file with pretty formatting
fs.writeFileSync(
    'formatted-policies.json',
    JSON.stringify(output, null, 2)
);

console.log('Done formatting policies');
