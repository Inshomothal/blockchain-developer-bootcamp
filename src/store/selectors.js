import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from "lodash";
import { ethers } from "ethers";

import moment from 'moment'

// State inputs
const account = state => get(state, 'provider.account')
const tokens = state => get(state, 'tokens.contracts')
const events = state => get(state, 'exchange.events')

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
    let tokenPrice = (token0Amount / token1Amount)

    return ({
        ...order,
        token0Amount: ethers.utils.formatUnits(token0Amount, 'ether'),
        token1Amount: ethers.utils.formatUnits(token1Amount, 'ether'),
        tokenPrice: tokenPrice,
        formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
    })
}

const filterOrderByToken = (orders, tokens) => {
    if(!tokens[0] || !tokens[1]) { return }


    // Grab only orders that are for the selected tokens
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // Now sort by selected tokens
    orders.sort((a,b) => a.tokenGet === tokens[0].address ? ( a.tokenGet - b.tokenGet ):( b.tokenGet - a.tokenGet))

    return orders
}

// --------------------------------------------------------------------------------------
// MY EVENTS

export const myEventsSelector = createSelector(
    account,
    events,
    (account, events) => {
        events = events.filter((e) => e.args.user === account)
        return events
    }
)

// --------------------------------------------------------------------------------------
// MY OPEN ORDERS

export const myOpenOrdersSelector = createSelector(
    account,
    tokens,
    openOrders,
    (account, tokens, orders) => {
        if(!tokens[0] || !tokens[1]) { return }

        // Filter orders created by current account
        orders = orders.filter((o) => o.user === account)

        // Filter orders by token addresses
        orders = filterOrderByToken(orders, tokens)

        // Decorate orders - add display attributes
        orders = decorateMyOpenOrders(orders, tokens)

        // Sort orders by date descending for display
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)

        return orders

    }
)

const decorateMyOpenOrders = (orders, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyOpenOrder(order, tokens)
            return order
        })

    )
}

const decorateMyOpenOrder = (order, tokens) => {
    let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    })
}

// --------------------------------------------------------------------------------------
// MY FILLED ORDERS

export const myFilledOrdersSelector = createSelector(
    filledOrders,
    tokens,
    account,
    (orders, tokens, account) => {
        if (!tokens[0] || !tokens[1]) { return }
        
        orders = orders.filter((o) => o.user === account || o.creator === account)
        // Filter orders by token addresses
        filterOrderByToken(orders, tokens)

        // Sort by date ascending
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)

        // Decorate orders - add display attributes
        orders = decorateMyFilledOrders(orders, account, tokens)

        return (orders)
    }
)

const decorateMyFilledOrders = (orders, account, tokens) => {
    return(
        orders.map((order) => {
            order = decorateOrder(order, tokens)
            order = decorateMyFilledOrder(order, account, tokens)
        return order
        })
    )
}

const decorateMyFilledOrder = (order, account, tokens) => {
    const myOrder = order.creator === account

    let orderType
    if (myOrder) {
        orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
    } else {
        orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'
    }


    return({
        ...order,
        orderType,
        orderTypeClass: (orderType === 'buy' ? GREEN : RED),
        orderSign: (orderType === 'buy' ? '+' : '-')
    })
}

// --------------------------------------------------------------------------------------
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }
        orders = filterOrderByToken(orders, tokens)

        // [X] Step 1: sort orders by time ascending
        // [X] Step 2: decorate orders - add display attributes
        // Step 3: sort orders by time descending for UI

        // Sort orders by timestamp ascending
        orders = orders.sort((a,b) => a.timestamp - b.timestamp)

        // Decorate the orders
        orders = decorateFilledOrders(orders, tokens)

        // Sort orders date descending for display
        orders = orders.sort((a,b) => b.timestamp - a.timestamp)

        return orders
    }
)

const decorateFilledOrders = (orders, tokens) => {
    // Track previous order to comare history
    let previousOrder = orders[0]

    return(
        orders.map((order) => {
        // decorate each individual order
        order = decorateOrder(order, tokens)
        order = decorateFilledOrder(order, previousOrder)
        previousOrder = order // Update the previous order once it's decorated
        return order
        })
    )
}

const decorateFilledOrder = (order, previousOrder) => {
    return({
        ...order,
        tokenPriceClass: (order.tokenPrice >= previousOrder.tokenPrice ? GREEN : RED)
    })
}

// --------------------------------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
    openOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }

        // Filter orders by selected tokens
        orders = filterOrderByToken(orders, tokens)

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
// PRICE CHART

export const priceChartSelector = createSelector(
    filledOrders,
    tokens,
    (orders, tokens) => {
        if (!tokens[0] || !tokens[1]) { return }


        // Filter orders by selected tokens
        filterOrderByToken(orders, tokens)

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
