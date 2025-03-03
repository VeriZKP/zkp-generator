// pages/merchant/page.tsx
"use client";
import React, { useState } from 'react';

interface ScanState {
    file: File | null;
}

const MerchantPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleScanQRCode = async () => {
        // Your scanning logic here
    };

    return (
        <div>
            <h1>Scan Student Discount QR Code</h1>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <button onClick={handleScanQRCode}>Scan QR Code</button>
        </div>
    );
}

export default MerchantPage;
