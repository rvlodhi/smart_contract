// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MyToken is ERC20 {
    // state variable, which will be used to know the fee percent
    uint256 public feePercent;

    // state variable, which will be used to know the accumulated fees
    uint256 public accumulatedFees;

    // variable to save the owner of the contract
    address private owner;

    // A mapping to store account balance  
    mapping(address => uint256) balances;
    
    constructor() ERC20("MyToken", "MTN") {
        console.log("In constructor");
        console.log("Owner address: %s", msg.sender);

        feePercent = 1; // assuming 1 percent fees

        balances[msg.sender] = 1000000; // 1 million tokens
        owner = msg.sender;
    }

    // function, which the user will call to send some amount of tokens, and 
    // will deduct the fees, and transfer the remaining amount of tokens
    function transferWithFees(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Not enough tokens");

        console.log("Sender balance is %s tokens", balances[msg.sender]);
        console.log("Fees deducted will be %s percent", feePercent);
        console.log("%s percent of %s tokens = %s MTN", feePercent, amount, ((amount * feePercent)/100));
        console.log("Tokens to be transferred after fees deduction = %s MTN", (amount - (amount * feePercent)/100));

        accumulatedFees += (amount * feePercent) / 100;

        // Transfer the amount
        balances[msg.sender] -= amount; // deducting from sender
        amount -= accumulatedFees; // deducting fees from amount
        balances[to] += amount; // updating receiver's balance
    }

    // function, which will be used to update the fee percent, only accessible 
    // to owner of the contract
    function updateFeePercent(uint256 newFeePercent) public isOwner {
        console.log("Old fee percent: %s", feePercent);
        console.log("New fee percent: %s", newFeePercent);

        feePercent = newFeePercent;

        console.log("Updated fee percent: %s", feePercent);
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
    function transferAccumulatedFees() public isOwner {
        console.log("Accumulated fees so far %s", accumulatedFees);
        console.log("Previous balance %s", balances[msg.sender]);

        balances[msg.sender] += accumulatedFees;
        accumulatedFees = 0;

        console.log("Current balance %s", balances[msg.sender]);
    }

    // modifier to check if caller is owner
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }
}
