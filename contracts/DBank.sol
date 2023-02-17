// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DBank {

    address public owner;
    mapping(address => bool) public admin;
    mapping(address => bool) public blacklist;

    mapping(address => uint256) public balances;

    struct Transaction {
        address payable recipient;
        uint256 amount;
        bool approved;
    }

    mapping(address => Transaction[]) public transactions;

    event ownerChanged(address _newOwner);
    event adminAdded(address _addr);
    event adminRemoved(address _addr);
    event blacklistAdded(address _addr);
    event blacklistRemoved(address _addr);
    event etherSent(uint256 amount, address _to);
    event transferRequested(address payable _to, uint256 _amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier onlyAdmin() {
        require(admin[msg.sender] == true, "You are no admin");
        _;
    }

    function changeOwner(address _newOwner) public onlyOwner {
        owner = _newOwner;
        emit ownerChanged(_newOwner);
    }

    function isOwner(address _addr) public view returns (bool) {
        return _addr == owner;
    }

    function isAdmin(address _addr) public view returns (bool) {
        return admin[_addr];
    }

    function isBlacklisted(address _addr) public view returns (bool) {
        return blacklist[_addr];
    }

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

    function requestTransfer(address payable _to, uint256 _amount) public {
        require(msg.sender.balance >= _amount, "Not enough ether");
        transactions[msg.sender].push(Transaction(_to, _amount, false));
        emit transferRequested(_to, _amount);
    }

    function approveTransfer(address _from, uint _transactionId) public onlyAdmin {
        Transaction memory transaction = transactions[_from][_transactionId];
        require(!transaction.approved, "Transaction was already approved");
        transaction.approved = true;
        transfer(_from, transaction.recipient, transaction.amount);
    }

    function transfer(address _from, address payable _recipient, uint256 _amount) public {
        // TODO implement transfer function
    }

    function checkTransfers(address _from) public view returns (Transaction[] memory) {
        return transactions[_from];
    }

}
