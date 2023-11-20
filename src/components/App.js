import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadToken
} from '../store/interactions';


function App() {

  const dispatch = useDispatch()

  const loadBlockchainData = async () => {
    // Grab accounts using Metmask with window.ethereum
    await loadAccount(dispatch)

    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork( provider, dispatch )

    // Token Smart Contract
    // Using ethers.Contract to connect to blockchain and utilize the abi to interact with the token
    await loadToken(provider, config[chainId].DAPP.address, dispatch)
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