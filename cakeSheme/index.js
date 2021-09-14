const {fetchP2PData, filterP2P} = require('./p2p.js')
const {pancakeTrade} = require('./pancake.js')
const {fetchGarantex} = require('./garantex.js')
const {getBNBFee} = require('./allFee.js')

async function cakeCalc(amountRUB) {
    const txFee = await getBNBFee()
    const bestSellOfferRate = await fetchGarantex()
    await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 5000)})
    const p2pData = await fetchP2PData()
    const BNBPrice = filterP2P(p2pData.data.data)
    const amountBNB = amountRUB / BNBPrice
    const realAmountBNB = amountBNB - (txFee * 2)
    const amountUSDT = await pancakeTrade(realAmountBNB)
    return  amountUSDT * bestSellOfferRate
}

module.exports = {cakeCalc}