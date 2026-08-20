import React, { useState } from 'react';
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

    const formatDate = (unixTimestamp: string) => {
        if (unixTimestamp === '0') return 'Present';
        return new Date(parseInt(unixTimestamp) * 1000).toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            <div className="pb-5 border-b border-indigo-200">
                <h2 className="text-2xl leading-6 font-bold text-indigo-900">Candidate Dashboard</h2>
                <p className="mt-2 max-w-4xl text-sm text-indigo-500">Manage your employment history and share verified records with future employers.</p>
            </div>

            <div className="bg-indigo-50 shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-indigo-900">Wallet Configuration</h3>
                        <p className="mt-1 text-sm text-indigo-500">
                            Configure your wallet address and private key for this PoC.
                        </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-4">
                                <label htmlFor="address" className="block text-sm font-medium text-indigo-700">Address</label>
                                <input type="text" id="address" value={candidateAddress} onChange={e => setCandidateAddress(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-indigo-300 rounded-md py-2 px-3 border" />
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                                <label htmlFor="pk" className="block text-sm font-medium text-indigo-700">Private Key (For PoC Signing)</label>
                                <input type="password" id="pk" value={privateKey} onChange={e => setPrivateKey(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-indigo-300 rounded-md py-2 px-3 border" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button onClick={fetchRecords} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Fetch My Records
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {records.length > 0 && (
                <div className="bg-indigo-50 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-indigo-900">My Employment Records</h3>
                    </div>
                    <div className="border-t border-indigo-200">
                        <table className="min-w-full divide-y divide-indigo-200">
                            <thead className="bg-indigo-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Company</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Start Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">End Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-indigo-50 divide-y divide-indigo-200">
                                {records.map(r => (
                                    <tr key={r.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-900">{r.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500">{r.companyId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500">{formatDate(r.startDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500">{formatDate(r.endDate)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-500">
                                            {r.isActive ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Past</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-indigo-50 shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-indigo-900">Grant Access</h3>
                        <p className="mt-1 text-sm text-indigo-500">
                            Provide consent for a future employer to verify a specific record.
                        </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-indigo-700">Future HR GSTIN</label>
                                <input type="text" placeholder="e.g. 29BBBBB5678B2Z6" value={targetGstin} onChange={e => setTargetGstin(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-indigo-300 rounded-md py-2 px-3 border" />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <label className="block text-sm font-medium text-indigo-700">Record ID</label>
                                <input type="number" placeholder="1" value={recordIdToGrant} onChange={e => setRecordIdToGrant(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-indigo-300 rounded-md py-2 px-3 border" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button onClick={handleGrantAccess} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Grant Access
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateDashboard;
