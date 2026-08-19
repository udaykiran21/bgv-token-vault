import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const CandidateDashboard: React.FC = () => {
    // For PoC, hardcoding Hardhat Account #1 as candidate
    const [candidateAddress, setCandidateAddress] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
    const [privateKey, setPrivateKey] = useState('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');

    const [records, setRecords] = useState<any[]>([]);

    const [targetGstin, setTargetGstin] = useState('');
    const [recordIdToGrant, setRecordIdToGrant] = useState('');

    const fetchRecords = async () => {
        try {
            const res = await axios.get(`${API_BASE}/candidate/records/${candidateAddress}`);
            setRecords(res.data.records);
        } catch (e: any) {
            alert('Failed to fetch records');
        }
    };

    const handleGrantAccess = async () => {
        try {
            const res = await axios.post(`${API_BASE}/record/grantAccess`, {
                candidatePrivateKey: privateKey,
                targetGstin,
                recordId: recordIdToGrant
            });
            alert(res.data.message);
        } catch (e: any) {
            alert(e.response?.data?.error || e.message);
        }
    };

    return (
        <div>
            <h2>Candidate Dashboard</h2>
            <div style={{ marginBottom: '20px' }}>
                <label>Address: </label>
                <input value={candidateAddress} onChange={e => setCandidateAddress(e.target.value)} style={{ width: '350px' }} />
                <br />
                <label>Private Key (For PoC Signing): </label>
                <input type="password" value={privateKey} onChange={e => setPrivateKey(e.target.value)} style={{ width: '350px' }} />
            </div>

            <button onClick={fetchRecords}>Fetch My Records</button>

            {records.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>My Employment Records</h3>
                    <table border={1} cellPadding={5} style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Company</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Active?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id}>
                                    <td>{r.id}</td>
                                    <td>{r.companyId}</td>
                                    <td>{r.startDate}</td>
                                    <td>{r.endDate === '0' ? 'Present' : r.endDate}</td>
                                    <td>{r.isActive ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
                <h3>Grant Access to Future HR</h3>
                <input placeholder="Future HR GSTIN" value={targetGstin} onChange={e => setTargetGstin(e.target.value)} />
                <input placeholder="Record ID to share" value={recordIdToGrant} onChange={e => setRecordIdToGrant(e.target.value)} />
                <button onClick={handleGrantAccess}>Grant Access</button>
            </div>
        </div>
    );
};

export default CandidateDashboard;
