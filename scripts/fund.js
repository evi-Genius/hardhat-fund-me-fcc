const { getNamedAccounts, deployments, ethers } = require("hardhat")

async function main(params) {
    const [owner] = await ethers.getSigners()
    const FundMe = await ethers.getContractAt(
        "FundMe",
        (
            await deployments.get("FundMe")
        ).address,
        owner
    )
    console.log("Funding Contract...")
    const transactionResponse = await FundMe.fund({
        value: ethers.parseEther("0.1"),
    })
    await transactionResponse.wait(1)
    console.log("Funded")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
