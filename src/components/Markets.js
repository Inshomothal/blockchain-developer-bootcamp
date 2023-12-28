import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { loadTokens, changeMarket } from '../store/interactions';


import config from '../config.json'

const Markets = () => {
  const provider = useSelector(state => state.provider.connection)
  const chainId = useSelector(state => state.provider.chainId)
  const selectedMarket = useSelector(state => state.exchange.selectedMarket)
  const selectRef = useRef()

  // const DAPP = config[chainId].DAPP.address
  // const mETH = config[chainId].mETH.address

  const dispatch = useDispatch()

  const marketHandler = async (e) => {
    // await loadTokens(provider, (e.target.value).split(','), dispatch)
    const newMarket = (e.target.value).split(',');
    await changeMarket(provider, dispatch, newMarket);
    await loadTokens(provider, selectedMarket.addresses, dispatch)
  }

  useEffect(() => {
    let selectedOption
    try {
      selectedOption = selectRef.current.value ? selectRef.current.value : null
    } catch (e) {
      console.log('waiting to load market...')
    }
    try {
      if (Object.keys(selectedMarket).length === 0) {
      let dapp = config[chainId].DAPP.address
      let meth = config[chainId].mETH.address

      let addresses = selectedOption ? selectedOption.split(',') : [dapp, meth];

      changeMarket(provider, dispatch, addresses)
      }
    } catch (e) {
      console.log('waiting to load network...')
    }
  }, [selectedMarket, dispatch, chainId, provider])
  
  return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Markets</h2>
  
        </div>

        {chainId ? (
        <select name="markets" id="markets" onChange={marketHandler} ref={selectRef}>
            <option value={`${config[chainId].DAPP.address},${config[chainId].mETH.address}`}>DApp / mEth</option>
            <option value={`${config[chainId].DAPP.address},${config[chainId].mDAI.address}`}>DApp / mDAI</option>
            <option value={`${config[chainId].mETH.address},${config[chainId].mDAI.address}`}>mEth / mDAI</option>
        </select>
        ) : (
        <div>
          Not Deployed to network
        </div>)}
  
        <hr />
      </div>
    )
  }
  
  export default Markets;
