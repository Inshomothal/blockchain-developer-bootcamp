import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { loadBalances } from '../store/interactions';

import dapp from '../assets/dapp.svg';

const Balance = () => {

    const account = useSelector(state => state.provider.account)

    const exchange = useSelector(state => state.exchange.contract)
    const exchangeBalances = useSelector(state => state.exchange.balances) // Array of exchange balances

    const tokens = useSelector(state => state.tokens.contracts) // Array of token contracts
    const symbols = useSelector(state => state.tokens.symbols) // Array of token symbols
    const tokenBalances = useSelector(state => state.tokens.balances) // Array of token balances
    

    const dispatch = useDispatch()

    useEffect(() => {
        if (exchange && tokens[0] && tokens[1] && account){
            loadBalances(exchange, tokens, dispatch, account)
        }
    }, [exchange, tokens, account])

    return (
      <div className='component exchange__transfers'>
        <div className='component__header flex-between'>
          <h2>Balance</h2>
          <div className='tabs'>
            <button className='tab tab--active'>Deposit</button>
            <button className='tab'>Withdraw</button>
          </div>
        </div>
  
        {/* Deposit/Withdraw Component 1 (DApp) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
            <p><small>Token</small><br /><img src={dapp} alt="Token Logo" />{symbols && symbols[0]}</p>
            <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
            <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
  
          </div>
  
          <form>
            <label htmlFor="token0"></label>
            <input type="text" id='token0' placeholder='0.0000' onChange={(e) => {console.log(e.target.value)}}/>
  
            <button className='button' type='submit'>
              <span></span>
            </button>
          </form>
        </div>
  
        <hr />
  
        {/* Deposit/Withdraw Component 2 (mETH) */}
  
        <div className='exchange__transfers--form'>
          <div className='flex-between'>
  
          </div>
  
          <form>
            <label htmlFor="token1"></label>
            <input type="text" id='token1' placeholder='0.0000'/>
  
            <button className='button' type='submit'>
              <span></span>
            </button>
          </form>
        </div>
  
        <hr />
      </div>
    );
  }
  
  export default Balance;