import { createSelector } from "reselect";
import { get, groupBy, reject } from "lodash";
import { ethers } from "ethers";

import moment from 'moment'

// State inputs
const tokens = state => get(state, 'tokens.contracts')

// Order colors
const GREEN = '#25CE8F'
const RED = '#F45353'

// Order types
const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
    const all = allOrders(state)
    const filled = filledOrders(state)
    const cancelled = cancelledOrders(state)

    const openOrders = reject(all, (order) => {
        const orderfilled = filled.some((o) => o.id.toString() === order.id.toString())
        const ordercancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
        return (orderfilled || ordercancelled)

    })

    return openOrders
}

const decorateOrder = (order, tokens) => {
    // Calculate token prices
    let token0Amount, token1Amount

    

    // Note: DApp should be considered token0, mETH is considered token1
    // Example: Giving mETH in exchange for DApp
    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGive // The amount of DApp we are giving
        token1Amount = order.amountGet // The amount of mETH we are receiving
    } else {
        token0Amount = order.amountGet // The amount of DApp we are receiving
        token1Amount = order.amountGive // The amount of mETH we are giving
    }

    const precision = 10^5
    let tokenPrice = (token1Amount / token0Amount)
    tokenPrice = Math.round(tokenPrice * precision) / precision

    return ({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, 'ether'),
        token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
        tokenPrice: tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

const decorateOrderBookOrder = (order, tokens) => {
    const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return ({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
    })
}

const decorateOrderBookOrders = (orders, tokens) => {
    return (
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateOrderBookOrder(order, tokens)
            return (order)
        })
    )
}

// ------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
    openOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // Decorate orders
        orders = decorateOrderBookOrders(orders, tokens)

        // Group orders by order type
        orders = groupBy(orders, 'orderType')

        // Fetch orders
        const buyOrders = get(orders, 'buy', [])
        const sellOrders = get(orders, 'sell', [])

        // Sort orders by token price
        orders = {
            ...orders,
            buyOrders: buyOrders.sort((a,b) => b.tokenPrice - a.tokenPrice),
            sellOrders: sellOrders.sort((a,b) => b.tokenPrice - a.tokenPrice)
        }
        
        return orders
    }
)