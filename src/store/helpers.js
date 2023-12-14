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

  // export const tabHandler = (e) => {
  //   if(e.target.className !== depositRef.current.className){
  //     e.target.className = 'tab tab--active'
  //     depositRef.current.className = 'tab'
  //     setIsDeposit(false)
  //   } else {
  //     e.target.className = 'tab tab--active'
  //     withdrawRef.current.className = 'tab'
  //     setIsDeposit(true)
  //   }

  //   return tabHandler
  // }
