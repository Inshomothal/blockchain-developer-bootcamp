import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { tabHandler } from '../store/helpers';
import {
  loadBalances,
  transferTokens
 }
 from '../store/interactions';

import dapp from '../assets/dapp.svg';
import eth from '../assets/eth.svg';

const Balance = () => {
  const [isDeposit, setIsDeposit] = useState(true)
  const [token1TransferAmount, settoken1TransferAmount] = useState(0)
  const [token2TransferAmount, settoken2TransferAmount] = useState(0)

  const dispatch = useDispatch()

  const account = useSelector(state => state.provider.account)
  const provider = useSelector(state => state.provider.connection)

  const exchange = useSelector(state => state.exchange.contract)
  const exchangeBalances = useSelector(state => state.exchange.balances) // Array of exchange balances
  const transferInProgress = useSelector(state => state.exchange.transferInProgress) // Boolean

  const tokens = useSelector(state => state.tokens.contracts) // Array of token contracts
  const symbols = useSelector(state => state.tokens.symbols) // Array of token symbols
  const tokenBalances = useSelector(state => state.tokens.balances) // Array of token balances

  const tabRef = [useRef(null), useRef(null)]

  // const tabHandler = (e) => {
  //   if(e.target.className !== depositRef.current.className){
  //     e.target.className = 'tab tab--active'
  //     depositRef.current.className = 'tab'
  //     setIsDeposit(false)
  //   } else {
  //     e.target.className = 'tab tab--active'
  //     withdrawRef.current.className = 'tab'
  //     setIsDeposit(true)
  //   }
  // }

  const amountHandler = (e, token) => {
    if (token.address === tokens[0].address){
      settoken1TransferAmount(e.target.value)
    } else {
      settoken2TransferAmount(e.target.value)
    }
    console.log({token2TransferAmount})
    console.log({ token1TransferAmount })
  }

  // [x] Step 1: Do transfer
  // [x] Step 2: Notify app that transfer is pending
  // [x] Step 3: Wait for transfer to be confirmed on blockchain
  // [x] Step 4: Notify app that transfer is complete
  // [x] Step 5: Notify app that transfer failed



  const depositHandler = (e, token) => {
    e.preventDefault()

    if (token.address === tokens[0].address){
      transferTokens(provider, exchange, 'Deposit', token, token1TransferAmount, dispatch)
      settoken1TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Deposit', token, token2TransferAmount, dispatch)
      settoken2TransferAmount(0)
    }
  }

  const withdrawHandler = (e, token) => {
    e.preventDefault()

    if (token.address === tokens[0].address){
      transferTokens(provider, exchange, 'Withdraw', token, token1TransferAmount, dispatch)
      settoken1TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Withdraw', token, token2TransferAmount, dispatch)
      settoken2TransferAmount(0)
    }
  }

  useEffect(() => {

    if (exchange && tokens[0] && tokens[1] && account){
          loadBalances(exchange, tokens, dispatch, account)
      }
  }, [exchange, tokens, account, transferInProgress, dispatch])

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button onClick={(e) => tabHandler(e, tabRef, setIsDeposit)} ref={tabRef[0]} className='tab tab--active'>Deposit</button>
          <button onClick={(e) => tabHandler(e, tabRef, setIsDeposit)} ref={tabRef[1]} className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={dapp} alt="Token Logo" />{symbols && symbols[0]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>

        </div>


        <form onSubmit={(e) => {isDeposit ? (depositHandler(e, tokens[0])) : (withdrawHandler(e, tokens[0]))}}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input
          type="text"
          id='token0'
          placeholder='0.0000'
          value= {token1TransferAmount === 0 ? '' : token1TransferAmount}
          onChange={(e) => amountHandler(e, tokens[0])}/>

          <button className='button' type='submit'>
            {isDeposit ? (
              <span>Deposit</span>
            ) : (
              <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={eth} alt="Token Logo" />{symbols && symbols[1]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p>
        </div>

        <form onSubmit={(e) => {isDeposit ? (depositHandler(e, tokens[1])) : (withdrawHandler(e, tokens[1]))}}>
          <label htmlFor="token1"></label>
          <input
          type="text"
          id='token1'
          placeholder='0.0000'
          value= {token2TransferAmount === 0 ? '' : token2TransferAmount}
          onChange={(e) => amountHandler(e, tokens[1])}/>

          <button className='button' type='submit'>
          {isDeposit ? (
              <span>Deposit</span>
            ) : (
              <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}
  
  export default Balance;
