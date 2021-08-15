// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MyToken is ERC20, ERC20Burnable, Ownable {
    // state variable, which will be used to know the fee percent
    uint256 public feePercent;

    // state variable, which will be used to know the accumulated fees
    uint256 public accumulatedFees;

    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 10000 * 10000000000000000); // 1 million tokens
        feePercent = 10; // assuming 10 percent fees
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // function, which the user will call to send some amount of tokens, and 
    // will deduct the fees, and transfer the remaining amount of tokens
    function transferWithFees(address to, uint256 amount) public returns (bool) {
        require(balanceOf(msg.sender) >= amount, "Not enough tokens");

        accumulatedFees += ((amount * feePercent) / 100);

        super.transfer(to, (amount - (amount * feePercent) / 100));
        super.burn((amount * feePercent) / 100);

        return true;
    }

    // function, which will be used to update the fee percent, only accessible 
    // to owner of the contract
    function updateFeePercent(uint256 newFeePercent) public onlyOwner {
        feePercent = newFeePercent;
    }

    // function to get the current fee percent
    function getFeePercent() public view returns (uint256) {
        return feePercent;
    }

    // function to get the accumulated fees
    function getAccumulatedFees() public view returns (uint256) {
        return accumulatedFees;
    }

    // function, which will be able to transfer the accumulated fees to the owner.
    function transferAccumulatedFees() public onlyOwner {
        mint(owner(), accumulatedFees);
        accumulatedFees = 0;
    }
}
