const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { deveplomentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

deveplomentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundme
          let deployer
          const sendValue = ethers.parseEther("0.05")
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
              console.log("funding...")
              const res = await fundme.fund({ value: sendValue })
              // NOTE!  这里的wait有什么作用？不加wait似乎会更容易withdraw失败？
              res.wait(3)
              console.log("withdrawing...")
              const transactionResponse = await fundme.withdraw()
              const transactionReceipt = await transactionResponse.wait(3)
              console.log("getbalance...")
              const endingBalance = await ethers.provider.getBalance(
                  fundme.target
              )
              console.log(endingBalance)
              // NOTE! 为什么这里会卡住？
              assert.equal(endingBalance, 0)
          })
      })
