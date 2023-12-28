import { useSelector } from 'react-redux';

import { filledOrdersSelector } from '../store/selectors';
import { finalPrice } from '../store/helpers';
import Banner from './Banner';

import sort from '../assets/sort.svg'
import { useEffect, useState } from 'react';

const Trades = () => {
    const filledOrders = useSelector(filledOrdersSelector)
    const symbols = useSelector(state => state.tokens.symbols)
    const [newFilledOrders, setNewFilledOrders] = useState([])

    useEffect(() => {
        if(filledOrders){
            setNewFilledOrders(filledOrders)
        }
    }, [filledOrders])

    return (
      <div className="component exchange__trades">
        <div className='component__header flex-between'>
          <h2>Trades</h2>
        </div>
  
        {!filledOrders || filledOrders.length === 0 ? (
            <Banner text='No transactions'/>
        ) : (
            <table>
          <thead>
            <tr>
              <th>Time <img src={sort} alt='Sort'/></th>
              <th>{symbols && symbols[0]} <img src={sort} alt='Sort'/></th>
              <th>{symbols && symbols[0]}/{symbols && symbols[1]} <img src={sort} alt='Sort'/></th>
            </tr>
          </thead>
          <tbody>
            {/* MAPPING OF ORDERS */}
            {filledOrders && filledOrders.map((order, index) => {
                return(
                    <tr key={index}>
                        <td>{order.formattedTimestamp}</td>
                        <td style={{color:`${order.tokenPriceClass}`}}>{order.token0Amount}</td>
                        <td>{finalPrice(order)}</td>
                     </tr>
                  )
            })}
            
          </tbody>
        </table>
        )}
  
      </div>
    );
  }
  
  export default Trades;