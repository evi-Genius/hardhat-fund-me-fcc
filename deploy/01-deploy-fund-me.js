// import
// main function
// calling of main funciton

// function deployFunc() {
//     console.log("Hi")
// }

// module.exports.default = deployFunc()

const { networkConfig, deveplomentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // if chainIdi x use address y
    let ethUsdPriceFeedAddress
    if (deveplomentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        const chainId = network.config.chainId
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    // if the contract doesn't exist, we deploy a minimal version

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !deveplomentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("--------------------------------")
}

module.exports.tags = ["all", "fundme"]
