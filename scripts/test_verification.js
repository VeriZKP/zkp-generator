const Web3 = require("web3");
const fs = require("fs");

// Load the ABI and contract address
const verifierABI = require("../build/contracts/PlonkVerifier.json");
const contractAddress = "0x23F8530bd28D1A958a3BD26d8fFcDF592c363074"; // Update with your deployed contract address

// Connect to Ganache
const web3 = new Web3("http://127.0.0.1:7545");
const verifierContract = new web3.eth.Contract(verifierABI.abi, contractAddress);

// Load Proof & Public Signals with hex-to-decimal conversion
function loadProof() {
    try {
        const proof = JSON.parse(fs.readFileSync("./outputs/proof.json", "utf8"));
        let publicSignals = JSON.parse(fs.readFileSync("./outputs/public.json", "utf8"));

        console.log("📌 Raw Public Signals from file:", publicSignals); // Debugging output

        // Ensure publicSignals is a flat array
        if (typeof publicSignals === 'object' && 'inputs' in publicSignals) {
            publicSignals = publicSignals.inputs;  // Extract only the array
        }

        if (!Array.isArray(publicSignals)) {
            throw new Error("Public signals should be an array but got: " + JSON.stringify(publicSignals));
        }

        // 🔹 Convert hexadecimal public signals to uint256 format
        publicSignals = publicSignals.map(hex => BigInt(hex).toString());

        console.log("📌 Fixed Public Signals:", publicSignals);
        return { proof, publicSignals };
    } catch (error) {
        console.error("❌ Error reading proof or public signals:", error);
        process.exit(1);
    }
}




// ✅ Fix: Convert Plonk proof hex values to uint256[]
function formatProof(proofData) {
    if (!proofData || typeof proofData !== "object") {
        throw new Error("Invalid proof data format!");
    }

    return [
        ...proofData.A,  // 3 values
        ...proofData.B,  // 3 values
        ...proofData.C,  // 3 values
        ...proofData.Z,  // 3 values
        ...proofData.T1, // 3 values
        ...proofData.T2, // 3 values
        ...proofData.T3, // 3 values
        proofData.eval_a,
        proofData.eval_b,
        proofData.eval_c,
    ].map(val => "0x" + BigInt(val).toString(16));  // Convert all values to uint256 (Solidity format)
}

async function getDebugEvents() {
    const events = await verifierContract.getPastEvents("DebugVerification", { fromBlock: 0 });
    console.log("🔹 DebugVerification Events:", events);
}

// **Verify Proof on Smart Contract**
async function verifyProof() {
    const { proof, publicSignals } = loadProof();
    const formattedProof = formatProof(proof);

    console.log("📌 Type of formattedProof:", typeof formattedProof, Array.isArray(formattedProof));
    console.log("📌 Type of publicSignals:", typeof publicSignals, Array.isArray(publicSignals));
    console.log("📌 Formatted Proof Length:", formattedProof.length); // Should be 24
    console.log("Public Signals Length:", publicSignals.length); // Should be 2
    console.log("📌 Formatted Proof:", formattedProof);
    console.log("📌 Public Signals:", publicSignals);

    try {
        //console.log("📌 Contract ABI expects:", verifierContract.methods.verifyProof._method.inputs);

        const accounts = await web3.eth.getAccounts();
        const sender = accounts[0];

        console.log("📌 Calling Solidity verifyProof with:");
        console.log(" - Proof (length):", formattedProof.length);
        console.log(" - Proof:", formattedProof);
        console.log(" - Public Signals (length):", publicSignals.length);
        console.log(" - Public Signals:", publicSignals)

        const isValid = await verifierContract.methods
            .verifyProof(formattedProof, publicSignals) 
            .call({ from: sender });

        console.log(isValid ? "✅ Proof is VALID" : "❌ Proof is INVALID");
    } catch (error) {
        console.error("❌ Error verifying proof:", error);
    }
}

// **Run Verification**
verifyProof();
