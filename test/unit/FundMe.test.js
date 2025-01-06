const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", async () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    let signer

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
        console.log("signer:", signer)
        console.log("deployer:", deployer)
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
        console.log("fundMe:", fundMe.target)
        console.log("MockV3Aggregator:", mockV3Aggregator.target)
    })

    // describe("constructor", async () => {
    //     it("sets the aggregator address correctly", async () => {
    //         const response = await fundMe.priceFeed()
    //         console.log("priceFeed:", response)
    //         assert.equal(response, mockV3Aggregator.target)
    //     })
    // })

    describe("fund", async () => {
        it("Fails if you don't send enough ETH", async () => {
            // let version = await fundMe.getVersion()
            // console.log("version:", version)
            // await fundMe.fund()
            await expect(fundMe.fund()).to.be.reverted
        })
    })
})
