// app/api/verify-proof/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as snarkjs from 'snarkjs'; // Importing all exports as snarkjs


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { proof, publicSignals } = req.body;
        try {
            const valid = await snarkjs.plonk.verify('verification_key.json', publicSignals, proof);
            res.status(200).json({ isValid: valid });
        } catch (error) {
            console.error('Error verifying proof:', error);
            res.status(500).send('Error verifying proof');
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
