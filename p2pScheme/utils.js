function calcMiddlePriceInCombination(combination, amountIn) {
    let combinationLimit = 0
    let amountOut = 0
    let balance = amountIn
    const prices = []
    combination.forEach(item => {
        combinationLimit += +item.dynamicMaxSingleTransAmount
    })
    if (combinationLimit < amountIn) {
        return false
    } else {
        combination.sort((a, b) => +a.price - +b.price)
        for (let i = 0; i < combination.length; i++) {
            const orderLimit = +combination[i].dynamicMaxSingleTransAmount
            const orderRate = +combination[i].price
            const advNo = combination[i].advNo
            const available = combination[i].dynamicMaxSingleTransQuantity
            balance -= orderLimit
            if (Math.sign(balance) === -1) {
                prices.push({value: (balance + orderLimit) / orderRate, rate: orderRate, advNo, available})
                break
            } else if (Math.sign(balance) === 1) {
                prices.push({value: orderLimit / orderRate, rate: orderRate, advNo, available})
            } else if (Math.sign(balance) === 0) {
                break
            }
        }
    }

    prices.forEach(({value})=> {
        amountOut += value
    })


    return {
        amount: amountOut,
        price: amountIn / amountOut,
        prices
    }
}

module.exports = {calcMiddlePriceInCombination}
