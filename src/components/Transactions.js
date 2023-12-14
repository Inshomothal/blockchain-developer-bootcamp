import { useSelector } from "react-redux";
import { useRef, useState } from "react";
import { myOpenOrdersSelector, myFilledOrdersSelector } from "../store/selectors";
import { finalPrice, tabHandler } from "../store/helpers";

import sort from '../assets/sort.svg'

import Banner from './Banner'

const Transactions = () => {
  const [showMyOrders, setShowMyOrders] = useState(true)
  const account = useSelector(state => state.provider.account)
  const symbols = useSelector(state => state.tokens.symbols)
  const myOpenOrders = useSelector(myOpenOrdersSelector)
  const myFilledOrders = useSelector(myFilledOrdersSelector)

  const tabRef = [useRef(null), useRef(null)]

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
                      <td><button name="Cancel"/></td>
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
    
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
    
              </tbody>
            </table>
    
          </div>
        )}
          
    
          
      </div>
    )
  }
  
  export default Transactions;