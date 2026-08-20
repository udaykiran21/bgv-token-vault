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

    const formatDate = (unixTimestamp: string) => {
        if (unixTimestamp === '0') return 'Present';
        return new Date(parseInt(unixTimestamp) * 1000).toLocaleDateString();
    };

    if (!isVerified) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-indigo-50 p-10 shadow-lg rounded-xl">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-indigo-900">HR Authentication</h2>
                        <p className="mt-2 text-center text-sm text-gray-600">Mock Government Verification Portal</p>
                    </div>
                    <div className="mt-8 space-y-6">
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="gstin" className="sr-only">GSTIN</label>
                                <input
                                    id="gstin"
                                    type="text"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-indigo-300 placeholder-gray-500 text-indigo-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter valid GSTIN (e.g. 27AAAAA1234A1Z5)"
                                    value={gstin}
                                    onChange={e => setGstin(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="text-sm text-indigo-500 bg-indigo-50 p-3 rounded-md border border-indigo-100">
                            <strong>Hint valid GSTINs:</strong><br/>
                            <ul className="list-disc pl-5 mt-1">
                                <li>27AAAAA1234A1Z5</li>
                                <li>29BBBBB5678B2Z6</li>
                                <li>33CCCCC9012C3Z7</li>
                            </ul>
                        </div>
                        <div>
                            <button
                                onClick={handleLogin}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Verify HR Identity
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="pb-5 border-b border-indigo-200">
                <h2 className="text-2xl leading-6 font-bold text-indigo-900">HR Dashboard</h2>
                <p className="mt-2 text-sm text-indigo-500">Authenticated as: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{gstin}</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Record Card */}
                <div className="bg-indigo-50 shadow rounded-lg overflow-hidden flex flex-col">
                    <div className="px-4 py-5 sm:p-6 flex-grow">
                        <h3 className="text-lg leading-6 font-medium text-indigo-900">1. Create Employment Record</h3>
                        <div className="mt-2 max-w-xl text-sm text-indigo-500">
                            <p>Register a new candidate when they join your organization.</p>
                        </div>
                        <div className="mt-5">
                            <label className="block text-sm font-medium text-indigo-700">Candidate ETH Address</label>
                            <input type="text" value={candidateAddr} onChange={e => setCandidateAddr(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-indigo-300 rounded-md py-2 px-3 border" />
                            <p className="mt-2 text-xs text-gray-400">Timestamp will be automatically fetched from the blockchain block.</p>
                        </div>
                    </div>
                    <div className="bg-indigo-100 px-4 py-4 sm:px-6">
                        <button onClick={handleCreateRecord} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Create Record
                        </button>
                    </div>
                </div>

                {/* Finalize Record Card */}
                <div className="bg-indigo-50 shadow rounded-lg overflow-hidden flex flex-col">
                    <div className="px-4 py-5 sm:p-6 flex-grow">
                        <h3 className="text-lg leading-6 font-medium text-indigo-900">2. Finalize Record</h3>
                        <div className="mt-2 max-w-xl text-sm text-indigo-500">
                            <p>Close a record when a candidate leaves and attach their relieving document.</p>
                        </div>
                        <div className="mt-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-indigo-700">Record ID</label>
                                <input type="number" placeholder="e.g. 1" value={recordIdFinalize} onChange={e => setRecordIdFinalize(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-indigo-300 rounded-md py-2 px-3 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-indigo-700">Relieving Document</label>
                                <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="mt-1 block w-full text-sm text-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-indigo-100 px-4 py-4 sm:px-6">
                        <button onClick={handleFinalizeRecord} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                            Finalize & Upload Doc
                        </button>
                    </div>
                </div>
            </div>

            {/* Verify Record Card */}
            <div className="bg-indigo-50 shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-indigo-900">3. Verify Previous Experience</h3>
                    <div className="mt-2 max-w-xl text-sm text-indigo-500">
                        <p>Verify a candidate's past employment record (requires candidate consent).</p>
                    </div>
                    <div className="mt-5 flex gap-4 items-end">
                        <div className="flex-grow max-w-xs">
                            <label className="block text-sm font-medium text-indigo-700">Record ID</label>
                            <input type="number" placeholder="e.g. 1" value={recordIdVerify} onChange={e => setRecordIdVerify(e.target.value)} className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-indigo-300 rounded-md py-2 px-3 border" />
                        </div>
                        <button onClick={handleVerifyRecord} className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 h-[38px]">
                            Verify
                        </button>
                    </div>

                    {verifiedData && (
                        <div className="mt-8 border-t border-indigo-200 pt-6">
                            <h4 className="text-md font-medium text-indigo-900 mb-4">Verification Results</h4>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-indigo-500">Candidate Address</dt>
                                    <dd className="mt-1 text-sm text-indigo-900 font-mono break-all">{verifiedData.candidate}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-indigo-500">Issuing Company (GSTIN)</dt>
                                    <dd className="mt-1 text-sm text-indigo-900 font-mono">{verifiedData.companyId}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-indigo-500">Start Date</dt>
                                    <dd className="mt-1 text-sm text-indigo-900">{formatDate(verifiedData.startDate)}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-indigo-500">End Date</dt>
                                    <dd className="mt-1 text-sm text-indigo-900">{formatDate(verifiedData.endDate)}</dd>
                                </div>
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-indigo-500">Times Verified</dt>
                                    <dd className="mt-1 text-sm text-indigo-900">{verifiedData.verificationCount} by other HRs</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-indigo-500">Document Hash (SHA256)</dt>
                                    <dd className="mt-1 text-sm text-indigo-900 font-mono break-all bg-indigo-100 p-2 rounded border border-indigo-200">{verifiedData.documentHash || "Not finalized yet"}</dd>
                                </div>
                            </dl>

                            {verifiedData.documentHash && (
                                <div className="mt-6">
                                    <a
                                        href={`${API_BASE}/document/${verifiedData.id}?gstin=${gstin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Download Verified Document
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
