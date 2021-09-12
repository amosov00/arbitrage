const {fetchP2PData, filterP2P} = require('./p2p.js')
const {pancakeTrade} = require('./pancake.js')
const {fetchGarantex} = require('./garantex.js')

async function cakeCalc(amountRUB) {
    const bestSellOfferRate = await fetchGarantex()
    const p2pData = await fetchP2PData()
    const BNBPrice = filterP2P(p2pData.data.data)
    const amountBNB = amountRUB / BNBPrice
    const amountUSDT = await pancakeTrade(amountBNB)
    return  amountUSDT * bestSellOfferRate
}

module.exports = {cakeCalc}