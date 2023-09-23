const { ethers } = require("hardhat");
const { expect } = require('chai');
const { invalid } = require("moment");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString() , 'ether')
}

const transferEmit = async () => {
    const event = result.events[0]
    expect(event.event).to.equal('Transfer')
                
    const args = event.args
    expect(args.from).to.equal(deployer.address)
    expect(args.to).to.equal(receiver.address)
    expect(args.value).to.equal(amount)
}

describe('Exchange', () => {
    let deployer,
        feeAccount,
        exchange
    
        const feePercent = 10

    beforeEach(async () => {
    
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        feeAccount = accounts[1]
        
        const Exchange = await ethers.getContractFactory('Exchange')
        exchange = await Exchange.deploy(feeAccount.address, feePercent)

    })

    describe('Deployment', () => {

        it('tracks the fee account', async () =>{
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
    
    
        })

        it('tracks the fee percent', async () =>{
            expect(await exchange.feePercent()).to.equal(feePercent)
    
    
        })
    })   
})
