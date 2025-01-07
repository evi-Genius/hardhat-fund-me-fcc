const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { deveplomentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

deveplomentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundme
          let deployer
          const sendValue = ethers.parseEther("0.1")
          beforeEach(async () => {
              const { deployer } = await getNamedAccounts()
              const [owner] = await ethers.getSigners()
              fundme = await ethers.getContractAt(
                  "FundMe",
                  (
                      await deployments.get("FundMe")
                  ).address,
                  owner
              )
          })
          it("allows people to fund and withdraw", async () => {
              await fundme.fund({ value: sendValue })
              await fundme.withdraw()
              const endingBalance = await ethers.provider.getBalance(
                  fundme.target
              )
              console.log(endingBalance)
              assert.equal(endingBalance.toString(), "0")
          })
      })
