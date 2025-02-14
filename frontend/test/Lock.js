// test/PaymentModule.test.ts
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("AppPayments", function () {
  async function deployPaymentFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const AppPayments = await ethers.getContractFactory("AppPayments");
    const payments = await AppPayments.deploy();
    return { payments, owner, otherAccount };
  }

  describe("Item Management", function () {
    it("Should set price for an item", async function () {
      const { payments, owner } = await loadFixture(deployPaymentFixture);
      await payments.setPrice(1, ethers.parseEther("0.1"));
      expect(await payments.getPrice(1)).to.equal(ethers.parseEther("0.1"));
    });

    it("Should only allow owner to set price", async function () {
      const { payments, otherAccount } = await loadFixture(deployPaymentFixture);
      await expect(
        payments.connect(otherAccount).setPrice(1, ethers.parseEther("0.1"))
      ).to.be.revertedWithCustomError(payments, "OwnableUnauthorizedAccount");
    });
  });

  describe("Payments", function () {
    it("Should accept correct payment", async function () {
      const { payments, owner, otherAccount } = await loadFixture(deployPaymentFixture);
      await payments.setPrice(1, ethers.parseEther("0.1"));
      await expect(
        payments.connect(otherAccount).makePayment(1, {
          value: ethers.parseEther("0.1")
        })
      ).to.not.be.reverted;
    });

    it("Should reject insufficient payment", async function () {
      const { payments, owner, otherAccount } = await loadFixture(deployPaymentFixture);
      await payments.setPrice(1, ethers.parseEther("0.1"));
      await expect(
        payments.connect(otherAccount).makePayment(1, {
          value: ethers.parseEther("0.05")
        })
      ).to.be.revertedWith("Insufficient payment");
    });
  });
});
