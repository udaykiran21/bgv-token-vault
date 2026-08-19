FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x ./start.sh
# Compile contracts
RUN npx hardhat compile
EXPOSE 8545
CMD ["./start.sh"]
