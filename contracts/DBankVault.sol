// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract DBankVault {
    receive() external payable {}
    fallback() external payable {}

    function getBalamce() public view returns (uint) {
        return address(this).balance;
    }
}