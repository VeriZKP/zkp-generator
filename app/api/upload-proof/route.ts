// app/api/upload-proof/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
// Importing the create function from ipfs-core
import { create } from 'ipfs-core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { proof } = req.body;
        try {
            // Using the create function to instantiate IPFS
            const ipfs = await create();
            const { cid } = await ipfs.add(JSON.stringify(proof));
            res.status(200).json({ cid: cid.toString() });
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            res.status(500).send('Error uploading proof');
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
