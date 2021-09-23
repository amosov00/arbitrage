const {pancakeTrade} = require('./pancake.js')
const {fetchGarantex} = require('./garantex.js')
const {getBNBFee} = require('./allFee.js')
const {lowCalc} = require('../p2pScheme/fetchP2PData.js')

async function cakeCalc(amountRUB) {
    await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 2000)})
    const txFee = await getBNBFee()
    const bestSellOfferRate = await fetchGarantex()
    const {price: rateBNB_binance, prices: binanceOrders} = await lowCalc(amountRUB, 4, 'BNB')
    const amountBNB = amountRUB / rateBNB_binance
    const realAmountBNB = amountBNB - (txFee * 2)
    const amountUSDT = await pancakeTrade(realAmountBNB)
    return {
        value: amountUSDT * bestSellOfferRate,
        orders: binanceOrders
    }
}

module.exports = {cakeCalc}