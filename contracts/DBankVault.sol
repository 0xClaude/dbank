// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DBankVault {
    address public owner;

    receive() external payable {}
    fallback() external payable {}

    event etherWithdrawn(uint256 _amount);
    event etherSent(address _from, uint256 _amount, address to);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdraw(uint256 _amount) public payable onlyOwner {
        require(address(this).balance > _amount, "Not enough ether");
        payable(owner).transfer(_amount);
        emit etherWithdrawn(_amount);
    }

    function send(uint256 _amount, address payable _addr)
        public
        payable
        onlyOwner
    {
        (bool sent,) = _addr.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        emit etherSent(msg.sender, _amount, _addr);
    }
}
