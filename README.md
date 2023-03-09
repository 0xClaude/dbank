# Decentralised Bank (DBank)

This project simulates a digital bank. Users can send transactions to other users, but the bank must first approve them.

Written in Solidity and React. Utilizes Nextjs.

# Howto

- Deploy the contract with "truffle migrate"
- Edit the contract address in /src/web3/contract.js
- Optional: Copy the ABI in for the contract in /src/web3/contract.js (this should already be the correct ABI)

Then, install the necessary npm modues:
- run `npm install`

Run the local environment
- run `npm start dev`

# Todo

- Some state optimisation is still needed
- Render different pages with react-router
- Implement the pause feature

Date: 09/03/2023
