const {lowCalc} = require('./fetchP2PData.js')
const {fetchGarantex} = require('./garantex.js')
const garantexTradeFee = 0.0015
const binanceUSDTwidthrawFee = 0.8
async function P2PSchemeCalc(amountRub, number) {
    console.log(`loop ${number}`, 'before lowCalc')
    const {price: rateUSDT_binance, prices: binanceOrders} = await lowCalc(amountRub, 4, 'USDT')
    console.log(`loop ${number}`, 'after lowCalc')
    if (!rateUSDT_binance) {
        return null
    }
    console.log(`loop ${number}`, 'before fetchGarantex')
    const rateUSDT_garantex = await fetchGarantex()
    console.log(`loop ${number}`, 'after fetchGarantex')
    const amountUSDT = (amountRub / rateUSDT_binance) - binanceUSDTwidthrawFee
    const rawOutputAmount = amountUSDT * rateUSDT_garantex
    const outputAmount = rawOutputAmount - (rawOutputAmount * garantexTradeFee)
    const invertProcent = 100 - (outputAmount * 100) / amountRub
    const procent = -invertProcent
    return {
        input: amountRub,
        output: outputAmount.toFixed(3).replace(/.$/,''),
        procent: procent.toFixed(5).replace(/.$/,''),
        binanceOrders
    }
}
module.exports = P2PSchemeCalc
