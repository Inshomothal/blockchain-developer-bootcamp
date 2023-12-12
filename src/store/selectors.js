import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from "lodash";
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

// Seperate Orders by type
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

// --------------------------------------------------------------------------------------
// Organize Order Data
const decorateOrder = (order, tokens) => {
    // Calculate token prices
    let token0Amount, token1Amount

    

    // Note: DApp should be considered token0, mETH is considered token1
    // Example: Giving mETH in exchange for DApp
    if (order.tokenGive === tokens[1].address) {
        token0Amount = order.amountGet // The amount of DApp we are giving
        token1Amount = order.amountGive // The amount of mETH we are receiving
    } else {
        token0Amount = order.amountGive // The amount of DApp we are receiving
        token1Amount = order.amountGet // The amount of mETH we are giving
    }

    // This was  tutorial funcion
    // const precision = 10^5
    let tokenPrice = (token1Amount / token0Amount)

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

// --------------------------------------------------------------------------------------
// Setup Price Chart Data

const buildGraphData = (orders) => {
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

    // Get each hour where data exists
    const hours = Object.keys(orders)

    const graphData = hours.map((hour) => {
        // Fetch all orders from current hour
        const group = orders[hour]

        // Calculate price values: open, high, low, close
        const open = group[0] // First order
        const high = maxBy(group, 'tokenPrice') // Highest price
        const low = minBy(group, 'tokenPrice') // Lowest price
        const close = group[group.length - 1] // Last order


        return({
            x: new Date(hour),
            y: [
                open.tokenPrice,
                high.tokenPrice,
                low.tokenPrice,
                close.tokenPrice
            ] // Arranging the candlestick data
        })
    })
    return graphData
}

// --------------------------------------------------------------------------------------
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

// --------------------------------------------------------------------------------------
// PRICE CHART

export const priceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Filter orders by selected tokens
        orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
        orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

        // Sort orders by timestamp descending
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)

        //Decorate orders - add display attributes
        orders = orders.map((o) => decorateOrder(o, tokens))

        let secondLastOrder, lastOrder
        [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)

        // get last order price
        lastOrder = orders[orders.length - 1]
        const lastPrice = get(lastOrder, 'tokenPrice', 0)

        // get second last order price
        const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

        return ({
            lastPrice,
            lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
            series: [{
                data: buildGraphData(orders),
            }]
        })
    }
)
