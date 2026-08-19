#!/bin/sh
set -e
npx hardhat node > hardhat.log 2>&1 &
echo "Waiting for Hardhat node to start..."
sleep 5
echo "Deploying contracts..."
npx hardhat run scripts/deploy.cjs --network localhost
echo "Blockchain is ready and contracts are deployed."
wait
