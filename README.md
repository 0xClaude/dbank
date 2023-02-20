# Decentralised Bank (DBank)

This project simulates a digital bank. Users can send transactions to other users, but the bank must first approve them.

Written in Solidity and React. Utilizes Nextjs.

# Howto

- Deploy the contracts with "truffle migrate"
- Edit the contract addresses in /src/web3/contract.js
- Optional: Copy the ABI in for the contracts in /src/web3/contract.js (this should already be the correct ABI)

Then, install the necessary npm modues:
- run `npm install`

Run the local environment
- run `npm start dev`

# Todo

Some features are not implemented yet:
- Admin: Approve the transaction
- User: submit approved transactions
- Optional: user can cancel their requested transactions

Date: 20/02/2023