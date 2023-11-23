import { useSelector, useDispatch } from 'react-redux';
import { loadTokens } from '../store/interactions';


import config from '../config.json'

const Markets = () => {
  const provider = useSelector(state => state.provider.connection)
  const chainId = useSelector(state => state.provider.chainId)

  const dispatch = useDispatch()

  const marketHandler = async (e) => {
    await loadTokens(provider, (e.target.value).split(','), dispatch)
  }
  
  return(
      <div className='component exchange__markets'>
        <div className='component__header'>
            <h2>Select Markets</h2>
  
        </div>

        {chainId ? (
        <select name="markets" id="markets" onChange={marketHandler}>
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
