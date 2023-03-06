// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DBank {
    // State variable for the contract owner
    address public owner;
    uint256 public transactionCount;

    // Let the contract receive funds
    receive() external payable {}

    fallback() external payable {}

    // Mappings for admins and blacklisted users
    mapping(address => bool) public admin;
    mapping(address => bool) public blacklist;

    // Struct for the transactions
    struct Transaction {
        uint256 id;
        address payable recipient;
        uint256 amount;
        bool approved;
        // TODO Add a bool for a rejected transfer
        // TODO Add a bool for a cancelled transfer
        bool submitted;
    }

    // Mappings for each user's transactions
    mapping(address => Transaction[]) public transactions;

    // Setting a reentrance guard
    bool private locked;

    // Events for the frontend
    event ownerChanged(address _newOwner);
    event adminAdded(address _addr);
    event adminRemoved(address _addr);
    event blacklistAdded(address _addr);
    event blacklistRemoved(address _addr);
    event transferRequested(
        uint256 _id,
        address _from,
        address payable _to,
        uint256 _amount
    );
    event transferApproved(address _from, uint256 _id);
    event transactionSend(address _from, uint256 _transactionId);

    // Setting up the contract and assigning owner
    constructor() {
        owner = msg.sender;
    }

    // Modifier for reentrance guard
    modifier noReentrance() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    // Modifier to exclude banned users
    modifier notBanned() {
        require(!isBlacklisted(msg.sender), "You are banned");
        _;
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
    function changeOwner(address _newOwner) public onlyOwner noReentrance {
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
    }

    function checkTransfers(address _from)
        public
        view
        returns (Transaction[] memory)
    {
        return transactions[_from];
    }

    // Adding and removing admins - only the owner can do so
    function addAdmin(address _addr) public onlyOwner noReentrance {
        require(admin[_addr] == false, "User is already admin");
        admin[_addr] = true;
        emit adminAdded(_addr);
    }

    function removeAdmin(address _addr) public onlyOwner noReentrance {
        require(admin[_addr] == true, "User is no admin");
        admin[_addr] = false;
        emit adminRemoved(_addr);
    }

    // Adding and removing blacklisted people
    // Only the owner and admins can do this
    function addBlacklist(address _addr) public onlyAdmin noReentrance {
        require(blacklist[_addr] == false, "User is already blacklisted");
        blacklist[_addr] = true;
        emit blacklistAdded(_addr);
    }

    function removeBlacklist(address _addr) public onlyAdmin noReentrance {
        require(blacklist[_addr] == true, "User is not blacklisted");
        blacklist[_addr] = false;
        emit blacklistRemoved(_addr);
    }

    // User wants to transfer money, the boolean is set to "false" initially
    function requestTransfer(address payable _to, uint256 _amount)
        public
        noReentrance
        notBanned
    {
        require(msg.sender.balance >= _amount, "Not enough ether");
        transactions[msg.sender].push(
            Transaction(transactionCount, _to, _amount, false, false)
        );
        emit transferRequested(transactionCount, msg.sender, _to, _amount);
        transactionCount++;
    }

    // Admins can approve transactions, boolean will be set to true
    function approveTransfer(address _from, uint256 _transactionId)
        public
        onlyAdmin
        noReentrance
    {
        Transaction memory transaction = transactions[_from][_transactionId];
        require(!transaction.approved, "Transaction was already approved");
        transactions[_from][_transactionId].approved = true;
        emit transferApproved(_from, _transactionId);
    }

    // Get the balance of the contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Get your funds back
    function withdraw(uint256 _transactionId) public noReentrance notBanned {}

    function transfer(uint256 _transactionId)
        public
        payable
        noReentrance
        notBanned
    {
        Transaction memory transaction = transactions[msg.sender][
            _transactionId
        ];
        require(
            transaction.approved == true,
            "Transaction was not approved yet"
        );
        require(
            msg.sender.balance >=
                transactions[msg.sender][_transactionId].amount,
            "Not enough Ether"
        );

        address payable _to = transactions[msg.sender][_transactionId]
            .recipient;
        uint256 _amount = transactions[msg.sender][_transactionId].amount;

        (bool sent, ) = _to.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        transactions[msg.sender][_transactionId].submitted = true;
        emit transactionSend(msg.sender, _transactionId);
    }
}
