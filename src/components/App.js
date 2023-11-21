import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExhange
} from '../store/interactions';

import Navbar from './Navbar';


function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {

    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch)

    // Fetch current network's chainId(e.g. hardhat:31337, kovan:42)
    const chainId = await loadNetwork( provider, dispatch )
    console.log(`app.js chainId is ${chainId}`)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Update account using Metmask with window.ethereum
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    // Token smart Contract
    const DAPP = config[chainId].DAPP
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DAPP.address, mETH.address], dispatch)

    // Load exchange smart contract
    const exchangeConfig = config[chainId].exchange
    await loadExhange(provider, exchangeConfig.address, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

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