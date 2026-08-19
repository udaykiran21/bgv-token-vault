import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const HRDashboard: React.FC = () => {
    const [gstin, setGstin] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    // Create Record state
    const [candidateAddr, setCandidateAddr] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');

    // Finalize Record state
    const [recordIdFinalize, setRecordIdFinalize] = useState('');
    const [file, setFile] = useState<File | null>(null);

    // Verify Record state
    const [recordIdVerify, setRecordIdVerify] = useState('');
    const [verifiedData, setVerifiedData] = useState<any>(null);

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${API_BASE}/hr/verify`, { gstin });
            if (res.data.success) setIsVerified(true);
        } catch (e: any) {
            alert(e.response?.data?.message || 'Verification failed');
        }
    };

    const handleCreateRecord = async () => {
        try {
            const res = await axios.post(`${API_BASE}/record/create`, {
                candidateAddress: candidateAddr,
                gstin
            });
            alert(`Record created! ID: ${res.data.recordId}`);
        } catch (e: any) {
            alert(e.response?.data?.message || e.message);
        }
    };

    const handleFinalizeRecord = async () => {
        if (!file) return alert('Please select a file');
        const formData = new FormData();
        formData.append('gstin', gstin);
        formData.append('recordId', recordIdFinalize);
        formData.append('document', file);

        try {
            const res = await axios.post(`${API_BASE}/record/finalize`, formData);
            alert(`Record finalized! Hash: ${res.data.documentHash}`);
        } catch (e: any) {
            alert(e.response?.data?.message || e.message);
        }
    };

    const handleVerifyRecord = async () => {
        try {
            const res = await axios.get(`${API_BASE}/record/verify/${recordIdVerify}?gstin=${gstin}`);
            setVerifiedData(res.data.data);
        } catch (e: any) {
            alert(e.response?.data?.error || 'Access denied or not found');
        }
    };

    if (!isVerified) {
        return (
            <div>
                <h2>HR Login (Mock Government Verification)</h2>
                <input
                    placeholder="Enter valid GSTIN (e.g. 27AAAAA1234A1Z5)"
                    value={gstin}
                    onChange={e => setGstin(e.target.value)}
                    style={{ width: '300px' }}
                />
                <button onClick={handleLogin}>Verify HR</button>
                <p><i>Hint valid GSTINs: 27AAAAA1234A1Z5, 29BBBBB5678B2Z6, 33CCCCC9012C3Z7</i></p>
            </div>
        );
    }

    return (
        <div>
            <h2>HR Dashboard - Logged in as {gstin}</h2>

            <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h3>1. Create Employment Record (Candidate Joins)</h3>
                <input placeholder="Candidate ETH Address" value={candidateAddr} onChange={e => setCandidateAddr(e.target.value)} style={{ width: '350px' }} />
                <button onClick={handleCreateRecord}>Create Record</button>
                <p><small>Timestamp will be automatically fetched from blockchain block.</small></p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h3>2. Finalize Record (Candidate Leaves)</h3>
                <input placeholder="Record ID" value={recordIdFinalize} onChange={e => setRecordIdFinalize(e.target.value)} />
                <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} />
                <button onClick={handleFinalizeRecord}>Finalize & Upload Doc</button>
                <p><small>Timestamp will be automatically fetched from blockchain block.</small></p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h3>3. Verify Previous Experience</h3>
                <input placeholder="Record ID" value={recordIdVerify} onChange={e => setRecordIdVerify(e.target.value)} />
                <button onClick={handleVerifyRecord}>Verify</button>
                {verifiedData && (
                    <div style={{ marginTop: '10px', background: '#eef', padding: '10px' }}>
                        <p><strong>Candidate:</strong> {verifiedData.candidate}</p>
                        <p><strong>Issuing Company:</strong> {verifiedData.companyId}</p>
                        <p><strong>Start Date (Unix):</strong> {verifiedData.startDate}</p>
                        <p><strong>End Date (Unix):</strong> {verifiedData.endDate}</p>
                        <p><strong>Document SHA256 Hash:</strong> {verifiedData.documentHash}</p>
                        <p><strong>Times Verified by other HRs:</strong> {verifiedData.verificationCount}</p>
                        {verifiedData.documentHash && (
                            <a
                                href={`${API_BASE}/document/${verifiedData.id}?gstin=${gstin}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button style={{ marginTop: '10px', background: '#4CAF50', color: 'white', padding: '10px' }}>
                                    View / Download Document
                                </button>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRDashboard;
