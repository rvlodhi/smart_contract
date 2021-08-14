const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const [owner] = await ethers.getSigners();

    const myToken = await ethers.getContractFactory("MyToken");

    const hardhatToken = await myToken.deploy();

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });
});

describe("Transfer with fees", function() {
  it("Should transfer tokens to the owner after deducting fees", async function() {

    const [owner, addr] = await ethers.getSigners();
    console.log("Address -> ", addr.address);


    const myToken = await ethers.getContractFactory("MyToken");

    const hardhatToken = await myToken.deploy();
    
    const prevBal = await hardhatToken.balanceOf(addr.address);
    console.log("Prev bal: ", prevBal);

    const prevOwnerBalance = await hardhatToken.balanceOf(owner.address);
    await hardhatToken.transferWithFees(addr.address, 100);
    const currOwnerBalance = await hardhatToken.balanceOf(owner.address);

    const feePercent = await hardhatToken.getFeePercent();
    const updatedBal = (prevOwnerBalance + feePercent);
    console.log("Current owner balance -> ", currOwnerBalance);
    console.log("Updated owner balance -> ", updatedBal);

    expect(currOwnerBalance).to.equal((prevOwnerBalance));
    
    const accumulatedFees = await hardhatToken.getAccumulatedFees();
    expect(accumulatedFees).to.equal(1);
  });
});

describe("Fees percent", function() {
  it("Should check the current fee percent", async function() {
    const myToken = await ethers.getContractFactory("MyToken");

    const hardhatToken = await myToken.deploy();
    const feePercent = await hardhatToken.getFeePercent();
    expect(feePercent).to.equal(1);
  });
});


describe("Accumulated Fees", function() {
  it("Should display the current accumulated fees", async function() {
    const [owner, addr] = await ethers.getSigners();

    const myToken = await ethers.getContractFactory("MyToken");

    const hardhatToken = await myToken.deploy();
    // const feePercent = await hardhatToken.getFeePercent();
    
    await hardhatToken.transferWithFees(addr.address, 100);
    const accumulatedFees = await hardhatToken.getAccumulatedFees();
    expect(accumulatedFees).to.equal(1);
  });
});

describe("Transfer accumulatedFees", function() {
  it("Should transfer the accumulated fees to the owner", async function() {
    const [owner] = await ethers.getSigners();

    const myToken = await ethers.getContractFactory("MyToken");
    const hardhatToken = await myToken.deploy();

    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    const accumulatedFees = await hardhatToken.getAccumulatedFees();

    await hardhatToken.transferAccumulatedFees();
    const updatedBalance = await hardhatToken.balanceOf(owner.address);

    const sum = ownerBalance + accumulatedFees;
    expect(updatedBalance).to.equal(sum);
    
  });
});

describe("Update Fee percent", function() {
  it("Should update the fee percent", async function() {
    const [owner] = await ethers.getSigners();
    const myToken = await ethers.getContractFactory("MyToken");
    const hardhatToken = await myToken.deploy();

    await hardhatToken.updateFeePercent(5);
    const updatedFeePercent = await hardhatToken.getFeePercent();

    expect(updatedFeePercent).to.equal(5);
  });
});