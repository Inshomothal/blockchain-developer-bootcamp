import { useSelector } from "react-redux";
import { myOpenOrdersSelector } from "../store/selectors";
import { finalPrice } from "../store/helpers";

import sort from '../assets/sort.svg'

import Banner from './Banner'

const Transactions = () => {

  const account = useSelector(state => state.provider.account)
  const symbols = useSelector(state => state.tokens.symbols)
  const myOpenOrders = useSelector(myOpenOrdersSelector)

    return (
      <div className="component exchange__transactions">
        <div>
          <div className='component__header flex-between'>
            <h2>My Orders</h2>
  
            <div className='tabs'>
              <button className='tab tab--active'>Orders</button>
              <button className='tab'>Trades</button>
            </div>
          </div>

          {/* {symbols ? } */}
  
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
  
        {/* <div> */}
          {/* <div className='component__header flex-between'> */}
            {/* <h2>My Transactions</h2> */}
  
            {/* <div className='tabs'> */}
              {/* <button className='tab tab--active'>Orders</button> */}
              {/* <button className='tab'>Trades</button> */}
            {/* </div> */}
          {/* </div> */}
  
          {/* <table> */}
            {/* <thead> */}
              {/* <tr> */}
                {/* <th></th> */}
                {/* <th></th> */}
                {/* <th></th> */}
              {/* </tr> */}
            {/* </thead> */}
            {/* <tbody> */}
  
              {/* <tr> */}
                {/* <td></td> */}
                {/* <td></td> */}
                {/* <td></td> */}
              {/* </tr> */}
  
            {/* </tbody> */}
          {/* </table> */}
  
        {/* </div> */}
      </div>
    )
  }
  
  export default Transactions;