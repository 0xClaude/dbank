// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

/// @title A decentralised banking application
/// @author Claude Biver
/// @notice DBank allows users on a private local blockchain to transfer funds among each other. An admin must approve the transaction beforehand.
/// @dev The projet assumes there are no gas fees.

// Using the ReentranceGuary from OpenZeppelin
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Using a pausable functionality from OpenZeppelin
import "@openzeppelin/contracts/security/Pausable.sol";

// Using the Address contract from OpenZeppelin
import "@openzeppelin/contracts/utils/Address.sol";

contract DBank is ReentrancyGuard, Pausable {
    // Set up the state variables
    address public owner;
    uint256 public transactionCount;

    // Let the contract receive funds and emit an event
    receive() external payable nonReentrant {
        emit etherReceived(msg.sender, msg.value);
    }

    // Mappings for admins and blacklisted users
    mapping(address => bool) public admin;
    mapping(address => bool) public blacklist;

    // The transaciton status can have one of five statuses:
    enum TransactionStatus {
        Pending,
        Approved,
        Rejected,
        Transmitted
    }

    // Struct for the transactions
    struct Transaction {
        uint256 id;
        address recipient;
        uint256 amount;
        TransactionStatus status;
    }

    // Mappings for each user's transactions
    mapping(address => Transaction[]) public transactions;

    // Events for the frontend
    event ownerChanged(address indexed _newOwner);
    event adminAdded(address indexed _addr);
    event adminRemoved(address indexed _addr);
    event blacklistAdded(address indexed _addr);
    event blacklistRemoved(address indexed _addr);
    event transferRequested(
        uint256 _id,
        address indexed _from,
        address payable _to,
        uint256 _amount
    );
    event transferApproved(address indexed _from, uint256 _id);
    event transferRejected(address indexed _from, uint256 _id);
    event fundsWithdrawn(address indexed _from, uint256 _transactionId);
    event transferCancelled(
        address _from,
        uint256 _transactionId,
        uint256 _amount
    );
    event etherReceived(address indexed _from, uint256 _amount);

    // Setting up the contract and assigning owner
    constructor() {
        owner = msg.sender;
    }

    // Get the balance of the contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //
    // MODIFIERS
    //

    // Modifier to exclude banned users
    modifier notBanned() {
        require(!isBlacklisted(msg.sender), "You are banned");
        _;
    }

    // Modifiers for owner only functions
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    // Modifier for admin only function
    modifier onlyAdmin() {
        require(admin[msg.sender], "You are no admin");
        _;
    }

    //
    // Owner functions
    //

    // Assign a new owner to the contract
    function changeOwner(address _newOwner) public onlyOwner whenNotPaused {
        owner = _newOwner;
        emit ownerChanged(_newOwner);
    }

    // Adding an adminstrator
    function addAdmin(
        address _addr
    ) public onlyOwner nonReentrant whenNotPaused {
        require(!admin[_addr], "User is already admin");
        admin[_addr] = true;
        emit adminAdded(_addr);
    }

    // Removing ah administrator
    function removeAdmin(
        address _addr
    ) public onlyOwner nonReentrant whenNotPaused {
        require(admin[_addr], "User is no admin");
        admin[_addr] = false;
        emit adminRemoved(_addr);
    }

    //
    // Admin functions
    //

    // Adding users to the blacklist, barring them from the dApp
    function addBlacklist(
        address _addr
    ) public onlyAdmin nonReentrant whenNotPaused {
        require(!blacklist[_addr], "User is already blacklisted");
        blacklist[_addr] = true;
        emit blacklistAdded(_addr);
    }

    // Unbanning users from the dApp
    function removeBlacklist(
        address _addr
    ) public onlyAdmin nonReentrant whenNotPaused {
        require(blacklist[_addr], "User is not blacklisted");
        blacklist[_addr] = false;
        emit blacklistRemoved(_addr);
    }

    //
    // Frontend functions
    //

    // Check whether the user is the contract owner
    function isOwner(address _addr) public view returns (bool) {
        return _addr == owner;
    }

    // Check whether the user is admin of the contract
    function isAdmin(address _addr) public view returns (bool) {
        return admin[_addr];
    }

    // Check whether the user is blacklisted
    function isBlacklisted(address _addr) public view returns (bool) {
        return blacklist[_addr];
    }

    function checkTransfers(
        address _from
    ) public view returns (Transaction[] memory) {
        return transactions[_from];
    }

    //
    // Contract functionality
    //

    // Request a new transfer
    function requestTransfer(
        address payable _to,
        uint256 _amount
    ) public payable nonReentrant notBanned whenNotPaused {
        require(msg.sender.balance >= _amount, "Not enough ether");
        require(!isBlacklisted(_to), "Recipient is banned");
        transactions[msg.sender].push(
            Transaction(
                transactionCount,
                _to,
                _amount,
                TransactionStatus.Pending
            )
        );
        emit transferRequested(transactionCount, msg.sender, _to, _amount);
        transactionCount++;
    }

    // Admins can approve a transfer
    function approveTransfer(
        address _from,
        uint256 _transactionId
    ) public onlyAdmin nonReentrant whenNotPaused {
        Transaction storage transaction = transactions[_from][_transactionId];
        require(
            transaction.status == TransactionStatus.Pending,
            "Transaction was already approved"
        );
        transaction.status = TransactionStatus.Approved;
        emit transferApproved(_from, _transactionId);
    }

    // Admins can reject a transfer
    function rejectTransfer(
        address _from,
        uint256 _transactionId
    ) public onlyAdmin nonReentrant whenNotPaused {
        Transaction storage transaction = transactions[_from][_transactionId];
        require(
            transaction.status == TransactionStatus.Pending,
            "Transaction is not pending"
        );
        transaction.status = TransactionStatus.Rejected;
        emit transferRejected(_from, _transactionId);
    }

    // Users can cancel a transfer
    function withdraw(
        address payable _from,
        uint256 _transactionId
    ) public nonReentrant notBanned {
        require(msg.sender == _from, "This is not your transaction");

        Transaction storage transaction = transactions[_from][_transactionId];
        require(
            transaction.status != TransactionStatus.Transmitted,
            "You already transmitted the funds"
        );
        // We set this boolean to true, so the user cannot withdraw twice
        transaction.status = TransactionStatus.Transmitted;

        uint256 _amount = transactions[_from][_transactionId].amount;
        Address.sendValue(_from, _amount);

        emit transferCancelled(msg.sender, _transactionId, _amount);
        emit fundsWithdrawn(msg.sender, _transactionId);
    }

    // When a transfer is approved, users can send the Ether
    function transfer(
        uint256 _transactionId
    ) public payable nonReentrant notBanned whenNotPaused {
        Transaction memory transaction = transactions[msg.sender][
            _transactionId
        ];
        require(
            transaction.status == TransactionStatus.Approved,
            "Transaction was not approved yet or funds have been transferred already."
        );
        require(msg.sender.balance >= transaction.amount, "Not enough Ether");

        address payable _to = payable(transaction.recipient);
        uint256 _amount = transaction.amount;

        Address.sendValue(_to, _amount);

        transaction.status = TransactionStatus.Transmitted;
        emit fundsWithdrawn(msg.sender, _transactionId);
    }
}
