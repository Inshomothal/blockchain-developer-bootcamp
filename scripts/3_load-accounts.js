// [ ] Load bootcamp accounts
// [ ] Load tokens
// [ ] transfer tokens to bootcamp accounts

const hre = require('hardhat')
const { ethers } = require("hardhat")

const config = require('../src/config.json')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString() , 'ether')
}

async function main () {
    // Fetch accounts from wallet - these are unlocked
    const baseAccounts = await ethers.getSigners()
    const accountRef = ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8']

    const accounts = baseAccounts.filter((o)=> o.address === accountRef[0] || o.address === accountRef[1])

    // Fetch network
    const { chainId } = await ethers.provider.getNetwork()
    console.log(`Using chainId: `, chainId)

    // Fetch deployed tokens
    const DAPP = await ethers.getContractAt(`Token`, config[chainId].DAPP.address)
    console.log(`Token fetched: ${DAPP.address}\n`)

    const mETH = await ethers.getContractAt(`Token`, config[chainId].mETH.address)
    console.log(`Token fetched: ${mETH.address}\n`)

    const mDAI = await ethers.getContractAt(`Token`, config[chainId].mDAI.address)
    console.log(`Token fetched: ${mDAI.address}\n`)

    
    if (accounts){
    // Give tokens to account[1]
    const sender = accounts[0]
    const receiver = accounts[1]
    let amount = tokens(50000)

    // user1 transfers 50,000 mETH...
    let transaction, result
    transaction = await mETH.connect(sender).transfer(receiver.address, amount)
    result = await transaction.wait()
    console.log(`Transferred ${amount} mETH tokens from ${sender.address} to ${receiver.address}\n`)

    // user1 transfers 50,000 DAPP...
    transaction = await DAPP.connect(sender).transfer(receiver.address, amount)
    result = await transaction.wait()
    console.log(`Transferred ${amount} DAPP tokens from ${sender.address} to ${receiver.address}\n`)

    // user1 transfers 50,000 mDAI...
    transaction = await mDAI.connect(sender).transfer(receiver.address, amount)
    result = await transaction.wait()
    console.log(`Transferred ${amount} mDAI tokens from ${sender.address} to ${receiver.address}\n`)
    } else {
        console.log(`No accounts found`)
    }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
