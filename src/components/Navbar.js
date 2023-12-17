import { useSelector, useDispatch } from 'react-redux';
import { loadAccount } from '../store/interactions';
import logo from '../assets/logo.png';
import Blockies from 'react-blockies';
import eth from '../assets/eth.svg';
import config from '../config.json';

const Navbar = () => {
    const provider = useSelector(state => state.provider.connection)
    const account = useSelector(state => state.provider.account)
    const chainId = useSelector(state => state.provider.chainId)
    const balance = useSelector(state => state.provider.balance)

    const dispatch = useDispatch()
    

    const connectHandler = async () => {
        
        
        // Load account with Metamask functionality
        await loadAccount(provider, dispatch)
    }

    const networkHandler = async (e) => {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: e.target.value }]
        })
    }


    return(
      <div className='exchange__header grid'>
        <div className='exchange__header--brand flex'>
            <img src={logo} className="logo" alt="logo" />
            <h1>DApp Token Exchange</h1>
  
        </div>
  
        <div className='exchange__header--networks flex'>
            <img src={eth} alt='ETH Logo' className='Eth Logo' />

            {chainId ? (
                <select name='networks' id='networks' value={config[chainId] ? `0x${chainId.toString(16)}` : `0`} onChange={networkHandler}>
                    <option value='0' disabled>Select Network</option>
                    <option value='0x7A69'>Localhost</option>
                    <option value='0xaa36a7'>Sepolia-Test</option>
                    <option value='0x13881'>Mumbai-Test</option>
                </select>
            ) : (
                `ChainId is ${chainId}`
            )}
            
            
        </div>
  
        <div className='exchange__header--account flex'>

            <p><small>My Balance</small>{balance ? (
                Number(balance).toFixed(4) + 'ETH'
                ) : (
                    "0 ETH"
                )}</p>
            {account ? (
                <a
                href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : '#'}
                target = '_blank'
                rel='noreferrer'
                >
                    {account.slice(0,7) + '...' + account.slice(37,42)}
                    <Blockies
                    account={account}
                    seed={account}
                    size={10}
                    scale={3}
                    color='#2187D0'
                    bgColor='#F1F2F9'
                    spotColor='#7676F92'
                    className='identicon'
                    />
                </a> 
                
            )   : (
            <button className='button' onClick={connectHandler}>Connect</button>
            )}
        </div>
      </div>
    )
  }
  
  export default Navbar;
