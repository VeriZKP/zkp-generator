// app/api/generate-proof/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as snarkjs from 'snarkjs'; // Importing all exports as snarkjs

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { institution, hashedId } = req.body;

        const input = `${institution}${hashedId}`;
        try {
            const { proof, publicSignals } = await snarkjs.plonk.fullProve({ input }, 'circuit.wasm', 'circuit_final.zkey');
            res.status(200).json({ proof, publicSignals });
        } catch (error) {
            console.error('Error generating proof:', error);
            res.status(500).send('Error generating proof');
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
