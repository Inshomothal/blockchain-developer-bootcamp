// Import Redux Functions
import { useSelector, useDispatch } from "react-redux";

// Import Assets
import sort from '../assets/sort.svg'

// Import selectors and functions
import { orderBookSelector } from "../store/selectors";
import { finalPrice } from "../store/helpers";
import { fillOrder } from "../store/interactions";




const OrderBook = () => {

  // Establish inputs
  const provider = useSelector(state => state.provider.connection)
  const exchange = useSelector(state => state.exchange.contract)
  const symbols = useSelector(state => state.tokens.symbols)
  const orderBook = useSelector(orderBookSelector)

  const dispatch = useDispatch()

  const fillOrderHandler = (order) => {
    fillOrder(provider, exchange, order, dispatch)
  }

  // TODO: Properly align sell orders in orderbook
  // TODO: Check if buy orders in orderbook need proper aligning
  return (
    <div className="component exchange__orderbook">
      <div className='component__header flex-between'>
        <h2>Order Book</h2>
      </div>

      <div className="flex">
        
        {/* MAPPING SELL ORDERS */}
        {!orderBook || orderBook.sellOrders.length === 0 ? (
          <p className="flex-center">No Sell Orders</p>
        ) : (
          <table className='exchange__orderbook--sell'>
          <caption>Selling</caption>
          <thead>
            <tr>
              <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
              <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              <th>{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
            </tr>
          </thead>
          <tbody>
            {orderBook && orderBook.sellOrders.map((order, index) => (
              <tr key={index} onClick={() => fillOrderHandler(order)}>
                <td>{order.token0Amount}</td>
                <td style={{ color: `${order.orderTypeClass}` }}>{finalPrice(order)}</td>
                <td>{order.token1Amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        

        <div className='divider'></div>

        {/* MAPPING BUY ORDERS */}
        {!orderBook || orderBook.buyOrders.length === 0 ? (
          <p className="flex-center">No Buy Orders</p>
        ) : (
        <table className='exchange__orderbook--buy'>
          <caption>Buying</caption>
          <thead>
            <tr>
              <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
              <th>{symbols && symbols[0]}/{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              <th>{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
            </tr>
          </thead>
          <tbody>
          {orderBook && orderBook.buyOrders.map((order, index) => (
              <tr key={index} onClick={() => fillOrderHandler(order)}>
                <td>{order.token0Amount}</td>
                <td style={{ color: `${order.orderTypeClass}` }}>{finalPrice(order)}</td>
                <td>{order.token1Amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
  }
  
export default OrderBook;
