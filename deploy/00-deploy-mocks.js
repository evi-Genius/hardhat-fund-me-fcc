const { network } = require("hardhat")

const {
    deveplomentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    console.log(`network name is ${network.name}`)
    console.log(`deployer is ${deployer}`)
    if (deveplomentChains.includes(network.name)) {
        console.log("Local network detected! Deploying Mocks...")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        console.log("Mocks deployed!")
        console.log("---------------------------------")
    } else {
        console.log("Remote networkdetected! Skipping mocks...")
    }
}

module.exports.tags = ["all", "mocks"]
