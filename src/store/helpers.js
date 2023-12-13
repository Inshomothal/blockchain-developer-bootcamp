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