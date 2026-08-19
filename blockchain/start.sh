#!/bin/sh
npx hardhat node &
# Wait for node to start
sleep 5
# Deploy and run script
npx hardhat run scripts/deploy.cjs --network localhost
# Keep container alive
wait
