import { useEffect } from 'react';
import {ethers} from 'ethers';
import config from '../config.json';
import TOKEN_ABI from '../abis/Token.json';
import '../App.css';

function App() {

  const loadBlockchainData = async () => {
    // Grab accounts using Metmask with window.ethereum
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
    console.log(accounts[0])

    // Connect Ethers to blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Test connection like this.
    // You can destructure network to the chainID value or object with { chainID }
    const network = await provider.getNetwork()
    const chainId = network.chainId
    console.log(chainId)

    // Test config import
    console.log(config[chainId])

    // Token Smart Contract
    // Using ethers.Contract to connect to blockchain and utilize the abi to interact with the token
    const token = new ethers.Contract(config[chainId].DAPP.address , TOKEN_ABI , provider)
    console.log(token.address)

    // Read information of token
    const symbol = await token.symbol()
    console.log(symbol)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;