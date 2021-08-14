const { expect } = require("chai");

describe("MyToken contract", function () {

  let MyToken;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    MyToken = await ethers.getContractFactory("MyToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    hardhatToken = await MyToken.deploy();
  });

  describe("Deployment", function () {
  
    it("Should set the right owner", async function () {
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      // Transfer 100 tokens from owner to addr1
      await hardhatToken.transferWithFees(addr1.address, 100);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(90);

      // Transfer 90 tokens from addr1 to addr2
      // We use .connect(signer) to send a transaction from another account
      let newBal = await hardhatToken.balanceOf(addr1.address);
      await hardhatToken.connect(addr1).transferWithFees(addr2.address, 90);
      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(81);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
      // `require` will evaluate false and revert the transaction.
      await expect(
        hardhatToken.connect(addr1).transferWithFees(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });

    it("Should update balances after transfers", async function () {
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      // Transfer 100 tokens from owner to addr1.
      await hardhatToken.transferWithFees(addr1.address, 100);

      // Transfer another 50 tokens from owner to addr2.
      await hardhatToken.transferWithFees(addr2.address, 50);

      // Check balances.
      const finalOwnerBalance = await hardhatToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(90);

      const addr2Balance = await hardhatToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(45);
    });
  });

  describe("Getter functions", function() {
    it("Should get current fee percent", async function() {
      const feePercent = await hardhatToken.getFeePercent();
      expect(feePercent).to.equal(10);
    });

    it("Should get current accumulated fees", async function() {
      const accumulatedFees = await hardhatToken.getAccumulatedFees();
      expect(accumulatedFees).to.equal(0);
    });
  });

  describe("Accumulated Fees", function() {
    it("should accumulate fees when performing transactions", async function() {
      await hardhatToken.transferWithFees(addr1.address, 100);
      const accumulatedFees = await hardhatToken.getAccumulatedFees();
      expect(accumulatedFees).to.equal(10);
    });
  });

  describe("Transfer accumulated fees", function() {
    it("should transfer the accumulated fees to the owner", async function() {
      
      await hardhatToken.transferWithFees(addr1.address, 100);
      const addr1Balance = await hardhatToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(90);

      const oldBalance = await hardhatToken.balanceOf(owner.address);
      expect(oldBalance).to.equal(999900);

      let accumulatedFees = await hardhatToken.getAccumulatedFees();
      expect(accumulatedFees).to.equal(10);
      await hardhatToken.transferAccumulatedFees();

      accumulatedFees = await hardhatToken.getAccumulatedFees();
      expect(accumulatedFees).to.equal(0);

      const newBalance = await hardhatToken.balanceOf(owner.address);

      expect(newBalance).to.equal(parseInt(oldBalance) + 10);
    });
  });

});