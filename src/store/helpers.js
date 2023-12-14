// Format Price
export const finalPrice = (order) => {
    let price = order.tokenPrice.toString();
    let nonZeroIndex = price.indexOf(price.split('').find(char => char !== '0' && char !== '.'));
    let finalPrice = nonZeroIndex !== -1 ? price.slice(0, nonZeroIndex + 4) : '0';
    if (price.length > nonZeroIndex + 4) {
      finalPrice += '...';
    }
  
    return finalPrice
}

export const tabHandler = (e, tabRef, balanceUseState=undefined, txUseState=undefined) => {
  if(balanceUseState) {
    if(e.target.className !== tabRef[0].current.className){
      e.target.className = 'tab tab--active'
      tabRef[0].current.className = 'tab'
      balanceUseState(false)
    } else {
      e.target.className = 'tab tab--active'
      tabRef[1].current.className = 'tab'
      balanceUseState(true)
    }
  }
  if(txUseState) {
    if(e.target.className !== tabRef[0].current.className){
      e.target.className = 'tab tab--active'
      tabRef[0].current.className = 'tab'
      txUseState(false)
    } else {
      e.target.className = 'tab tab--active'
      tabRef[1].current.className = 'tab'
      txUseState(true)
    }
  }
  return tabHandler
}
