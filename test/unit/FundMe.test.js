const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", async () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    let signer
    const sentValue = ethers.parseEther("1")

    beforeEach(async () => {
        await deployments.fixture("all")
        // This is wrong way to get deployer address
        // deployer = await getNamedAccounts().deployer
        const { deployer } = await getNamedAccounts()
        // signer = deployer
        const [owner] = await ethers.getSigners()
        // console.log("owner:", owner)
        signer = owner
        // const accounts = await hre.ethers.getSigners()
        // const signer = accounts[0]
        // console.log("signer:", signer)
        // console.log("deployer:", deployer)
        if (!deployer) {
            throw new Error("Deployer address is null")
        }
        // fundMe = await ethers.getContract("FundMe", deployer)
        fundMe = await ethers.getContractAt(
            "FundMe",
            (
                await deployments.get("FundMe")
            ).address,
            signer
        )
        //  await ethers.getContractAt("FundMe", deployer) -> Not work! return deployer's address
        mockV3Aggregator = await ethers.getContractAt(
            "MockV3Aggregator",
            (
                await deployments.get("MockV3Aggregator")
            ).address,
            signer
        )
        // console.log("fundMe:", fundMe.target)
        // console.log("MockV3Aggregator:", mockV3Aggregator.target)
    })

    // describe("constructor", async () => {
    //     it("sets the aggregator address correctly", async () => {
    //         const response = await fundMe.getPriceFeed()
    //         console.log("getPriceFeed:", response)
    //         assert.equal(response, mockV3Aggregator.target)
    //     })
    // })

    describe("fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
            // let version = await fundMe.getVersion()
            // console.log("version:", version)
            // await fundMe.fund()
            // await expect(fundMe.fund()).to.be.reverted
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("updated the amount funded data structure", async () => {
            await fundMe.fund({ value: sentValue })
            const reponse = await fundMe.getAddressToAmountFunded(
                signer.address
            )
            assert.equal(reponse.toString(), sentValue.toString())
        })
        it("Add funder to array of getFunder", async () => {
            await fundMe.fund({ value: sentValue })
            const response = await fundMe.getFunder(0)
            assert.equal(response, signer.address)
        })
    })

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sentValue })
        })

        it("withdraw ETH from a single founder", async () => {
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const startingDeployBalance = await ethers.provider.getBalance(
                signer.address
            )
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const endingDeployBalance = await ethers.provider.getBalance(
                signer.address
            )
            // console.log(typeof endingDeployBalance)
            // console.log(startingFundMeBalance + startingDeployBalance)
            assert.equal(
                startingFundMeBalance + startingDeployBalance,
                // endingDeployBalance
                endingDeployBalance + gasCost
            )
        })
        it("allow us to withdraw multiple getFunder", async () => {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sentValue })
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const startingDeployBalance = await ethers.provider.getBalance(
                signer.address
            )
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const endingDeployBalance = await ethers.provider.getBalance(
                signer.address
            )
            assert.equal(
                startingFundMeBalance + startingDeployBalance,
                endingFundMeBalance + endingDeployBalance + gasCost
            )
            await expect(fundMe.getFunder(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
        it("Only allow the owner to withdraw", async () => {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe_NotOwner")
        })

        it("cheaper withdraw testing ...", async () => {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sentValue })
            }
            const startingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const startingDeployBalance = await ethers.provider.getBalance(
                signer.address
            )
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, gasPrice } = transactionReceipt
            const gasCost = gasUsed * gasPrice

            const endingFundMeBalance = await ethers.provider.getBalance(
                fundMe.target
            )
            const endingDeployBalance = await ethers.provider.getBalance(
                signer.address
            )
            assert.equal(
                startingFundMeBalance + startingDeployBalance,
                endingFundMeBalance + endingDeployBalance + gasCost
            )
            await expect(fundMe.getFunder(0)).to.be.reverted
            for (let i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })
    })
})
