const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { ethers } = require('ethers');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up file storage using multer
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Mock GSTIN registry for valid Companies/HRs
const VALID_GSTINS = new Set([
    '27AAAAA1234A1Z5',
    '29BBBBB5678B2Z6',
    '33CCCCC9012C3Z7'
]);

// Helper to compute SHA-256 hash of a file
function computeFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// Simple JSON DB to keep track of recordId to filePath mapping
const DB_PATH = path.join(__dirname, 'db.json');
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}));
}
function saveFileMapping(recordId, filename) {
    const data = JSON.parse(fs.readFileSync(DB_PATH));
    data[recordId] = filename;
    fs.writeFileSync(DB_PATH, JSON.stringify(data));
}
function getFileMapping(recordId) {
    const data = JSON.parse(fs.readFileSync(DB_PATH));
    return data[recordId];
}

// Blockchain interaction setup
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
// In a real app we wouldn't store private keys like this, but for PoC we use hardhat's first default account to act as a relayer
const privateKey = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// Using NonceManager to let ethers handle concurrent nonces seamlessly
const wallet = new ethers.Wallet(privateKey, provider);
const nonceManagerWallet = new ethers.NonceManager(wallet);

// Load compiled contract artifact
let contractArtifact;
try {
    contractArtifact = require('../../blockchain/artifacts/contracts/EmploymentRegistry.sol/EmploymentRegistry.json');
} catch (e) {
    console.warn("Contract artifact not found. Please compile the hardhat project.");
}

const contractAddress = process.env.CONTRACT_ADDRESS;
let contract;

if (contractArtifact && contractAddress) {
    contract = new ethers.Contract(contractAddress, contractArtifact.abi, nonceManagerWallet);
}

// Routes

// 1. Authenticate / Verify HR by GSTIN
app.post('/api/hr/verify', (req, res) => {
    const { gstin } = req.body;
    if (VALID_GSTINS.has(gstin)) {
        res.json({ success: true, message: "HR Verified successfully" });
    } else {
        res.status(401).json({ success: false, message: "Invalid or Unregistered Company GSTIN" });
    }
});

// 2. Create Record (Candidate joins)
app.post('/api/record/create', async (req, res) => {
    try {
        const { candidateAddress, gstin } = req.body;

        if (!VALID_GSTINS.has(gstin)) {
            return res.status(401).json({ success: false, message: "Unauthorized HR" });
        }

        if (!contract) {
            return res.status(500).json({ error: "Contract not initialized" });
        }

        const tx = await contract.createRecord(candidateAddress, gstin);
        const receipt = await tx.wait();

        // Find RecordCreated event to get the recordId
        const event = receipt.logs.map(log => contract.interface.parseLog(log))
            .find(parsedLog => parsedLog && parsedLog.name === 'RecordCreated');

        const recordId = event.args.recordId.toString();

        res.json({ success: true, recordId, message: "Record created successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Finalize Record (Candidate leaves, upload doc)
app.post('/api/record/finalize', upload.single('document'), async (req, res) => {
    try {
        const { recordId, gstin } = req.body;
        const file = req.file;

        if (!VALID_GSTINS.has(gstin)) {
            return res.status(401).json({ success: false, message: "Unauthorized HR" });
        }

        if (!file) {
            return res.status(400).json({ success: false, message: "No document uploaded" });
        }

        if (!contract) {
            return res.status(500).json({ error: "Contract not initialized" });
        }

        // Compute hash
        const fileHash = computeFileHash(file.path);

        const tx = await contract.finalizeRecord(recordId, gstin, fileHash);
        await tx.wait();

        // Save mapping to our local db
        saveFileMapping(recordId, file.filename);

        res.json({ success: true, documentHash: fileHash, message: "Record finalized successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Candidate grants access to HR
app.post('/api/record/grantAccess', async (req, res) => {
    try {
        // In a real app, candidate would sign this transaction from their wallet directly,
        // but for this PoC where the backend relays everything, we'll just send it.
        // We'll impersonate the candidate if they pass their private key (just for PoC simplicity)
        const { candidatePrivateKey, targetGstin, recordId } = req.body;

        const candidateWallet = new ethers.NonceManager(new ethers.Wallet(candidatePrivateKey, provider));
        const candidateContract = contract.connect(candidateWallet);

        const tx = await candidateContract.grantAccess(targetGstin, recordId);
        await tx.wait();

        res.json({ success: true, message: "Access granted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. HR verifies and views a record
app.get('/api/record/verify/:recordId', async (req, res) => {
    try {
        const { recordId } = req.params;
        const gstin = req.query.gstin;

        if (!VALID_GSTINS.has(gstin)) {
            return res.status(401).json({ success: false, message: "Unauthorized HR" });
        }

        if (!contract) {
            return res.status(500).json({ error: "Contract not initialized" });
        }

        // Call verifyAndGetRecord (this is a state-changing transaction because it increments verify count)
        const tx = await contract.verifyAndGetRecord(recordId, gstin);
        await tx.wait();

        // Fetch the updated record details
        const record = await contract.getRecord(recordId);

        res.json({
            success: true,
            data: {
                id: record.id.toString(),
                candidate: record.candidate,
                companyId: record.companyId,
                startDate: record.startDate.toString(),
                endDate: record.endDate.toString(),
                documentHash: record.documentHash,
                verificationCount: record.verificationCount.toString(),
                isActive: record.isActive
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Access denied or record not found." });
    }
});

// 6. Download document endpoint
app.get('/api/document/:recordId', async (req, res) => {
    try {
        const { recordId } = req.params;
        const gstin = req.query.gstin;

        if (!VALID_GSTINS.has(gstin)) {
            return res.status(401).json({ success: false, message: "Unauthorized HR" });
        }

        // Before returning file, check access permission from contract
        const record = await contract.getRecord(recordId);

        // If not the original creator, we need to ensure access was granted (otherwise they'd just guess IDs)
        if (record.companyId !== gstin) {
             const hasAccess = await contract.accessPermissions(record.candidate, gstin, recordId);
             if (!hasAccess) {
                 return res.status(403).json({ success: false, error: "Access denied" });
             }
        }

        const filename = getFileMapping(recordId);
        if (!filename) {
            return res.status(404).json({ success: false, error: "Document not found" });
        }

        const filepath = path.join(uploadDir, filename);
        if (fs.existsSync(filepath)) {
            res.download(filepath);
        } else {
            res.status(404).json({ success: false, error: "Physical file missing" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. Get Candidate Records
app.get('/api/candidate/records/:address', async (req, res) => {
    try {
        const { address } = req.params;

        if (!contract) {
            return res.status(500).json({ error: "Contract not initialized" });
        }

        const recordIds = await contract.getCandidateRecords(address);

        const records = await Promise.all(recordIds.map(async (id) => {
             const r = await contract.getRecord(id);
             return {
                id: r.id.toString(),
                companyId: r.companyId,
                startDate: r.startDate.toString(),
                endDate: r.endDate.toString(),
                documentHash: r.documentHash,
                verificationCount: r.verificationCount.toString(),
                isActive: r.isActive
             };
        }));

        res.json({ success: true, records });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
