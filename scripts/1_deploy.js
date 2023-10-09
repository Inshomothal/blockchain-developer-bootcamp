const { ethers } = require("hardhat")

async function main() {
    // Fetch contract to deploy
    const Token = await ethers.getContractFactory(`Token`)
    const Exchange =  await ethers.getContractFactory(`Exchange`)

    // Fetch accounts
    const accounts = await ethers.getSigners()

    console.log(`Accounts fetched: \n${accounts[0].address}\n${accounts[1].address}\n`)


    // Deploy contracts
    const DAPP = await Token.deploy(`Dapp University`, `DAPP`, `1000000`)
    await DAPP.deployed()
    console.log(`DAPP Token Deployed to: ${DAPP.address}`)

    const mETH = await Token.deploy(`mETH`, `mETH`, `1000000`)
    await mETH.deployed()
    console.log(`mETH token Deployed to: ${mETH.address}`)

    const mDAI = await Token.deploy(`mDAI`, `mDAI`, `1000000`)
    await mDAI.deployed()
    console.log(`mDAI token Deployed to: ${mDAI.address}`)

    const exchange = await Exchange.deploy(accounts[1].address, 10)
    await exchange.deployed()
    console.log(`Exchange deployed to: ${exchange.address}`)
}


main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
