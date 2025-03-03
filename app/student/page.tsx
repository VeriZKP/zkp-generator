// app/student/page.tsx
"use client";
import React, { useState } from 'react';

const StudentPage: React.FC = () => {
    const [studentId, setStudentId] = useState<string>('');
    const [proofData, setProofData] = useState<any>(null);

    const generateProof = async () => {
        const response = await fetch('/api/generate-proof', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ institution: 'SIT', hashedId: studentId })
        });
        const data = await response.json();
        setProofData(data);
    };

    return (
        <div>
            <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter Student ID"
            />
            <button onClick={generateProof}>Generate Proof</button>
            <pre>{JSON.stringify(proofData, null, 2)}</pre>
        </div>
    );
};

export default StudentPage;
