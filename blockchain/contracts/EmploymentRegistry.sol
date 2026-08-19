// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EmploymentRegistry {
    address public owner;

    struct EmploymentRecord {
        uint256 id;
        address candidate;
        string companyId; // e.g., GSTIN
        uint256 startDate;
        uint256 endDate;
        string documentHash;
        uint256 verificationCount;
        bool isActive;
    }

    uint256 private _recordIds;

    // candidate address => array of record IDs
    mapping(address => uint256[]) public candidateRecords;

    // record ID => EmploymentRecord
    mapping(uint256 => EmploymentRecord) public records;

    // Mapping for access control: candidate -> targetCompanyId -> recordId -> bool
    // This implies a candidate allows a specific company to view a specific record
    mapping(address => mapping(string => mapping(uint256 => bool))) public accessPermissions;

    event RecordCreated(uint256 indexed recordId, address indexed candidate, string companyId, uint256 startDate);
    event RecordFinalized(uint256 indexed recordId, address indexed candidate, string companyId, uint256 endDate, string documentHash);
    event AccessGranted(address indexed candidate, string companyId, uint256 indexed recordId);
    event RecordVerified(uint256 indexed recordId, string verifyingCompanyId);

    constructor() {
        owner = msg.sender;
    }

    // Called by HR (backend) when a candidate joins
    function createRecord(address _candidate, string memory _companyId) public returns (uint256) {
        _recordIds++;
        uint256 newRecordId = _recordIds;

        records[newRecordId] = EmploymentRecord({
            id: newRecordId,
            candidate: _candidate,
            companyId: _companyId,
            startDate: block.timestamp,
            endDate: 0,
            documentHash: "",
            verificationCount: 0,
            isActive: true
        });

        candidateRecords[_candidate].push(newRecordId);

        emit RecordCreated(newRecordId, _candidate, _companyId, block.timestamp);
        return newRecordId;
    }

    // Called by HR (backend) when a candidate leaves
    function finalizeRecord(uint256 _recordId, string memory _companyId, string memory _documentHash) public {
        EmploymentRecord storage record = records[_recordId];
        require(record.isActive, "Record is not active or already finalized");

        // In a real system, we'd strictly enforce that only the original creator can finalize,
        // but for this PoC relying on backend verification, we just check the companyId matches.
        require(keccak256(bytes(record.companyId)) == keccak256(bytes(_companyId)), "Only the issuing company can finalize");

        record.endDate = block.timestamp;
        record.documentHash = _documentHash;
        record.isActive = false;

        emit RecordFinalized(_recordId, record.candidate, _companyId, block.timestamp, _documentHash);
    }

    // Candidate grants access to a future HR (identified by companyId)
    function grantAccess(string memory _companyId, uint256 _recordId) public {
        require(records[_recordId].candidate == msg.sender, "Only candidate can grant access");
        accessPermissions[msg.sender][_companyId][_recordId] = true;
        emit AccessGranted(msg.sender, _companyId, _recordId);
    }

    // New HR retrieves the record (if they have access) and increments verification count
    function verifyAndGetRecord(uint256 _recordId, string memory _verifyingCompanyId) public returns (EmploymentRecord memory) {
        EmploymentRecord storage record = records[_recordId];
        require(accessPermissions[record.candidate][_verifyingCompanyId][_recordId], "Access not granted by candidate");

        record.verificationCount++;
        emit RecordVerified(_recordId, _verifyingCompanyId);

        return record;
    }

    function getCandidateRecords(address _candidate) public view returns (uint256[] memory) {
        return candidateRecords[_candidate];
    }

    function getRecord(uint256 _recordId) public view returns (EmploymentRecord memory) {
        return records[_recordId];
    }
}
