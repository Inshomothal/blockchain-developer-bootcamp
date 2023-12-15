import { useSelector, useDispatch } from "react-redux";
import { useRef, useState } from "react";

import { myOpenOrdersSelector, myFilledOrdersSelector } from "../store/selectors";
import { cancelOrder } from "../store/interactions";
import { finalPrice, tabHandler } from "../store/helpers";

import sort from '../assets/sort.svg'

import Banner from './Banner'

const Transactions = () => {
  const [showMyOrders, setShowMyOrders] = useState(true)

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)
  const exchange = useSelector(state => state.exchange.contract)
  const symbols = useSelector(state => state.tokens.symbols)
  const myOpenOrders = useSelector(myOpenOrdersSelector)
  const myFilledOrders = useSelector(myFilledOrdersSelector)

  const dispatch = useDispatch()



  const tabRef = [useRef(null), useRef(null)]

  const cancelHandler = (order) => {
    cancelOrder(provider, exchange, order, dispatch)
  }

    return (
      <div className="component exchange__transactions">
        {showMyOrders ? (
          <div>
            <div className='component__header flex-between'>
              <h2>My Orders</h2>

              <div className='tabs'>
                <button onClick={(e) => tabHandler(e, tabRef, undefined, setShowMyOrders)} ref={tabRef[0]} className='tab tab--active'>Orders</button>
                <button onClick={(e) => tabHandler(e, tabRef, undefined, setShowMyOrders)} ref={tabRef[1]} className='tab'>Trades</button>
              </div>
            </div>

            <table> {!symbols ? (
              <p>error</p>
            ) : (
              <thead>
                <tr>
                  <th>{symbols[0]}<img src={sort} alt="Sort" /></th>
                  <th>{symbols[0]}/{symbols[1]}<img src={sort} alt="Sort" /></th>
                  <th>Cancel?</th>
                </tr>
              </thead>
            )}
              <tbody>
                {!account || myOpenOrders.length === 0 ? (
                  <Banner text='No open orders'/>
                ) : (
                  myOpenOrders && myOpenOrders.map((order, index) => {
                    return(
                    <tr key={index}>
                      <td style={{color: `${order.orderTypeClass}`}}>{order.token0Amount}</td>
                      <td>{finalPrice(order)}</td>
                      <td><button className='button--sm' onClick={()=>cancelHandler(order)}>Cancel</button></td>
                    </tr>)
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className='component__header flex-between'> 
              <h2>My Transactions</h2>

              <div className='tabs'>
                <button onClick={(e) => tabHandler(e, tabRef, undefined, setShowMyOrders)} ref={tabRef[0]} className='tab tab--active'>Orders</button>
                <button onClick={(e) => tabHandler(e, tabRef, undefined, setShowMyOrders)} ref={tabRef[1]} className='tab'>Trades</button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Time<img src={sort} alt="Sort" /></th>
                  <th>{symbols[0]}<img src={sort} alt="Sort" /></th>
                  <th>{symbols[0]}/{symbols[1]}<img src={sort} alt="Sort" /></th>
                </tr>
              </thead>
              <tbody>
                {myFilledOrders && myFilledOrders.map((order, index) => {
                  return(
                    <tr key={index}>
                      <td>{order.formattedTimestamp}</td>
                      <td style={{color: `${order.orderClass}`}}>{order.orderSign}{order.token0Amount}</td>
                      <td>{finalPrice(order)}</td>
                    </tr>)
                })
              }
                

              </tbody>
            </table>
    
          </div>
        )}

      </div>
    )
  }
  
  export default Transactions;