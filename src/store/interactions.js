import {ethers} from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exhange.json';

let tempHolder

const updateBalance = async (provider, dispatch, account) => {
    let balance
    try {
        balance = await provider.getBalance(account)
        balance = ethers.utils.formatEther(balance)
        tempHolder = balance
    } catch (e) {
        balance = tempHolder? tempHolder : 0.0
    }

    dispatch({type: 'ETHERS_BALANCE_LOADED', balance})
}

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({type: 'PROVIDER_LOADED', connection })

    return connection
}

export const loadNetwork = async (provider, dispatch) => {
    const { chainId } = await provider.getNetwork()
    dispatch({type: 'NETWORK_LOADED', chainId})

    return chainId
}

export const loadAccount = async (provider, dispatch) => {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
    const account = ethers.utils.getAddress(accounts[0]) // Formats the account address

    dispatch({type: 'ACCOUNT_LOADED', account})

    updateBalance(provider, dispatch, account)

    return account
}

export const loadTokens = async (provider, addresses, dispatch) => {
    let token, symbol

    /* AFTER TUTORIAL */
    /* CREATE MAP OBJECT THAT ALLOWS MULTIPLE PAIRS AND ADDS THEM TO ELEMENT */

    token = new ethers.Contract(addresses[0], TOKEN_ABI , provider) // Using ethers.Contract to connect to blockchain and utilize the abi to interact with the token
    symbol = await token.symbol()

    dispatch({type: 'TOKEN_1_LOADED', token, symbol})

    token = new ethers.Contract(addresses[1], TOKEN_ABI , provider) // Using ethers.Contract to connect to blockchain and utilize the abi to interact with the token
    symbol = await token.symbol()

    dispatch({type: 'TOKEN_2_LOADED', token, symbol})

    return token
}

export const loadExhange = async (provider, address, dispatch) => {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({type: 'EXCHANGE_LOADED', exchange})

    return exchange
}

export const subscribeToEvents = async (exchange, dispatch, provider, account) => {
    exchange.on('Deposit', (token, user, amount, balance, event) => {
        dispatch({ type: 'TRANSFER_SUCCESS', event })
        updateBalance(provider, dispatch, account)
    })

    exchange.on('Withdraw', (token, user, amount, balance, event) => {
        dispatch({ type: 'TRANSFER_SUCCESS', event })
        updateBalance(provider, dispatch, account)
    })

    exchange.on('Order', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'NEW_ORDER_SUCCESS', order, event })
        updateBalance(provider, dispatch, account)
    })

    exchange.on('Trade', (id, user, tokenGet, amountGet, tokenGive, amountGive, creator, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'FILL_ORDER_SUCCESS', order, event })
        updateBalance(provider, dispatch, account)
    })

    exchange.on('Cancel', (id, user, tokenGet, amountGet, tokenGive, amountGive, timestamp, event) => {
        const order = event.args
        dispatch({ type: 'CANCEL_ORDER_SUCCESS', order, event })
        updateBalance(provider, dispatch, account)
    })
}

// --------------------------------------------------------------------------------------
// CHANGE MARKET
export const changeMarket = async (provider, dispatch, tokens) => {

    if (!tokens.every(token => ethers.utils.isAddress(token))) {
        console.error('Invalid token address');
        return;
    }

    tokens[0] = new ethers.Contract(tokens[0], TOKEN_ABI , provider)
    tokens[1] = new ethers.Contract(tokens[1], TOKEN_ABI , provider)
    const symbols = [await tokens[0].symbol(), await tokens[1].symbol()]
    const market = {
        symbols: (`${symbols[0]} / ${symbols[1]}`),
        addresses: [tokens[0].address, tokens[1].address]
    }
    dispatch({type: 'CHANGE_MARKET', market})


}


// --------------------------------------------------------------------------------------
// LOAD USER BALANCES (WALLET & EXCHANGE BALANCES)

export const loadBalances = async (exchange, tokens, dispatch, account) => {
    let balance = ethers.utils.formatUnits(await tokens[0].balanceOf(account), 18)
    dispatch({type: 'TOKEN_1_BALANCE_LOADED', balance })

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[0].address, account), 18)
    dispatch({type: 'TOKEN_1_EXCHANGE_BALANCE_LOADED', balance })

    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18)
    dispatch({type: 'TOKEN_2_BALANCE_LOADED', balance })

    balance = ethers.utils.formatUnits(await exchange.balanceOf(tokens[1].address, account), 18)
    dispatch({type: 'TOKEN_2_EXCHANGE_BALANCE_LOADED', balance })
}

// --------------------------------------------------------------------------------------
// LOAD ALL ORDERS

export const loadAllOrders = async (provider, exchange, dispatch) => {
    const block = await provider.getBlockNumber()

    // Fetch cancelled orders
    const cancelStream = await exchange.queryFilter('Cancel', 0, block)
    const cancelledOrders = cancelStream.map(event => event.args)

    dispatch({type: 'CANCELLED_ORDERS_LOADED', cancelledOrders})

    // Fetch filled orders
    const tradeStream = await exchange.queryFilter('Trade', 0, block)
    const filledOrders = tradeStream.map(event => event.args)

    dispatch({type: 'FILLED_ORDERS_LOADED', filledOrders})

    // Fetch all orders
    const orderStream = await exchange.queryFilter('Order', 0, block)
    const allOrders = orderStream.map(event => event.args)

    dispatch({type: 'ALL_ORDERS_LOADED', allOrders})

}

// --------------------------------------------------------------------------------------
// TRANSFER TOKENS (DEPOSIT & WITHDRAWS)

export const transferTokens = async (provider, exchange, transferType, token, amount, dispatch) => {
    let transaction

    dispatch({type: 'TRANSFER_TOKENS_PENDING'})


    try {
    const signer = await provider.getSigner()
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18)

    if (transferType === `Deposit`){
        transaction =  await token.connect(signer).approve(exchange.address, amountToTransfer)
        await transaction.wait()
        transaction = await exchange.connect(signer).depositToken(token.address, amountToTransfer)
    } else {
        transaction =  await token.connect(signer).approve(exchange.address, amountToTransfer)
        await transaction.wait()
        transaction = await exchange.connect(signer).withdrawToken(token.address, amountToTransfer)
    }

    await transaction.wait()

    } catch (error) {
        dispatch({type: 'TRANSFER_FAIL'})
    }
}

// --------------------------------------------------------------------------------------
// ORDERS (BUY & SELL)

export const makeBuyOrder = async (provider, exchange, token, order, dispatch) => {
    const tokenGet = token[0].address
    const amountGet = ethers.utils.parseUnits(order.amount.toString(), 18)
    const tokenGive = token[1].address
    const amountGive = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)

    dispatch({type: 'NEW_ORDER_REQUEST'})

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    } catch (error) {
        dispatch({type: 'NEW_ORDER_FAIL'})
    }
}

export const makeSellOrder = async (provider, exchange, token, order, dispatch) => {
    const tokenGet = token[1].address
    const amountGet = ethers.utils.parseUnits((order.amount * order.price).toString(), 18)
    const tokenGive = token[0].address
    const amountGive = ethers.utils.parseUnits(order.amount.toString(), 18)

    dispatch({type: 'NEW_ORDER_REQUEST'})

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).makeOrder(tokenGet, amountGet, tokenGive, amountGive)
        await transaction.wait()
    } catch (error) {
        dispatch({type: 'NEW_ORDER_FAIL'})
    }
}

// --------------------------------------------------------------------------------------
// CANCEL ORDER

export const cancelOrder = async (provider, exchange, order, dispatch) => {
    dispatch({type: 'CANCEL_ORDER_REQUEST'})

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).cancelOrder(order.id)
        await transaction.wait()
    } catch (error) {
        dispatch({type: 'CANCEL_ORDER_FAIL'})
    }
}

// --------------------------------------------------------------------------------------
// FILL ORDER
export const fillOrder = async (provider, exchange, order, dispatch) => {
    dispatch({type: 'FILL_ORDER_REQUEST'})

    try {
        const signer = await provider.getSigner()
        const transaction = await exchange.connect(signer).fillOrder(order.id)
        await transaction.wait()
    } catch (error) {
        dispatch({type: 'FILL_ORDER_FAIL'})
    }
}
