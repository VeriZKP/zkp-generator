// app/api/generate-qr/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import * as QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { data } = req.body; // Assuming 'data' is what you want to encode in QR
        try {
            const qr = await QRCode.toDataURL(data);
            res.status(200).json({ qr });
        } catch (error) {
            console.error('Error generating QR:', error);
            res.status(500).send('Error generating QR code');
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
