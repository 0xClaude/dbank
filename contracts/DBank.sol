// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DBank {
    address public owner;
    mapping(address => bool) public admin;
    mapping(address => bool) public blacklist;

    struct Transaction {
        address payable recipient;
        string message;
        uint256 amount;
        bool approved;
    }

    mapping(address => Transaction[]) public transactions;

    event adminAdded(address _addr);
    event blacklistRemoved(address _addr);

    constructor() {
        owner = msg.sender;
        admin[msg.sender] = true;
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

    function showOwnTxs(address _addr)
        public
        view
        returns (Transaction[] memory)
    {
        return transactions[_addr];
    }

    function addAdmin(address _addr) public {
        admin[_addr] = true;
        emit adminAdded(_addr);
    }

    function removeAdmin(address _addr) public {
        admin[_addr] = false;
    }

    function addBlacklist(address _addr) public {
        blacklist[_addr] = true;
    }

    function removeBlacklist(address _addr) public {
        blacklist[_addr] = false;
        emit blacklistRemoved(_addr);
    }

    function sendEther(address payable _to) payable external {
        uint256 amount = msg.value;
        _to.transfer(amount);
    }
}
