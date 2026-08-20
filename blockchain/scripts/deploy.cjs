const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const EmploymentRegistry = await hre.ethers.getContractFactory("EmploymentRegistry");
  const registry = await EmploymentRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();
  console.log("EmploymentRegistry deployed to:", address);

  // Write address to a .env file for the backend
  const envContent = `CONTRACT_ADDRESS=${address}\n`;
  try { fs.mkdirSync(path.join(__dirname, "../../backend"), { recursive: true }); fs.writeFileSync(path.join(__dirname, "../../backend/.env"), envContent, { flag: 'a' }); } catch(e) { console.warn("Could not write to backend .env", e); }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
