// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DBank {
    
    // State variable for the contract owner
    address public owner;

    // Mappings for admins and blacklisted users
    mapping(address => bool) public admin;
    mapping(address => bool) public blacklist;

    // Struct for the transactions
    struct Transaction {
        address payable recipient;
        uint256 amount;
        bool approved;
    }

    // Mappings for each user's transactions
    mapping(address => Transaction[]) public transactions;

    // Events for the frontend
    event ownerChanged(address _newOwner);
    event adminAdded(address _addr);
    event adminRemoved(address _addr);
    event blacklistAdded(address _addr);
    event blacklistRemoved(address _addr);
    event etherSent(uint256 amount, address _to);
    event transferRequested(address _from, address payable _to, uint256 _amount);
    event transferApproved(address _from, uint256 _id);
    event transactionSend(address _from, uint256 _transactionId);

    // Setting up the contract and assigning owner
    constructor() {
        owner = msg.sender;
    }

    // Modifiers for owner and admin only functions
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier onlyAdmin() {
        require(admin[msg.sender] == true, "You are no admin");
        _;
    }

    // Only the owner can change the owner of the contract
    function changeOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
        emit ownerChanged(_newOwner);
    }

    // Functions needed for the frontend
    function isOwner(address _addr) public view returns (bool) {
        return _addr == owner;
    }

    function isAdmin(address _addr) public view returns (bool) {
        return admin[_addr];
    }

    function isBlacklisted(address _addr) public view returns (bool) {
        return blacklist[_addr];

    function checkTransfers(address _from) public view returns (Transaction[] memory) {
        return transactions[_from];
    }
    }
    
    // Admin related functions
    function addAdmin(address _addr) public onlyOwner {
        require(admin[_addr] == false, "User is already admin");
        admin[_addr] = true;
        emit adminAdded(_addr);
    }

    function removeAdmin(address _addr) public onlyOwner {
        require(admin[_addr] == true, "User is no admin");
        admin[_addr] = false;
        emit adminRemoved(_addr);
    }

    function addBlacklist(address _addr) public onlyAdmin {
        require(blacklist[_addr] == false, "User is already blacklisted");
        blacklist[_addr] = true;
        emit blacklistAdded(_addr);
    }

    function removeBlacklist(address _addr) public onlyAdmin {
        require(blacklist[_addr] == true, "User is not blacklisted");
        blacklist[_addr] = false;
        emit blacklistRemoved(_addr);
    }

    // User wants to transfer money, the boolean is set to "false" initially
    function requestTransfer(address payable _to, uint256 _amount) public {
        require(msg.sender.balance >= _amount, "Not enough ether");
        transactions[msg.sender].push(Transaction(_to, _amount, false));
        emit transferRequested(msg.sender, _to, _amount);
    }

    // Admins can approve transactions, boolean will be set to true
    function approveTransfer(address _from, uint _transactionId) public onlyAdmin {
        Transaction memory transaction = transactions[_from][_transactionId];
        require(!transaction.approved, "Transaction was already approved");
        transactions[_from][_transactionId].approved = true;
        emit transferApproved(_from, _transactionId);
    }

    // If the boolean is set to true, the user can then transfer the funds
    function transfer(uint256 _transactionId) public {
        Transaction memory transaction = transactions[msg.sender][_transactionId];
        require(transaction.approved == true, "Transaction was not approved yet");
        address payable _to = transactions[msg.sender][_transactionId].recipient;
        uint256 _amount = transactions[msg.sender][_transactionId].amount;
        _to.transfer(_amount);
        emit transactionSend(msg.sender, _transactionId);
    }

}
