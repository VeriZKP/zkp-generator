const express = require('express');
const snarkjs = require('snarkjs');
const app = express();
app.use(express.json());

app.post('/api/generate-proof', async (req, res) => {
    const { institution, hashedId } = req.body;

    // Concatenating institution and hashed ID
    const input = `${institution}${hashedId}`;

    try {
        // Assuming you have your circuit ready and the input properly defined in your circuit
        const { proof, publicSignals } = await snarkjs.plonk.fullProve({ input }, 'circuit.wasm', 'circuit_final.zkey');

        // Optionally, save the JSON to a file or handle it as needed
        const fs = require('fs');
        const proofData = { proof, publicSignals };
        fs.writeFileSync('proof.json', JSON.stringify(proofData));

        res.json(proofData);
    } catch (error) {
        console.error('Error generating proof:', error);
        res.status(500).send('Error generating proof');
    }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));
