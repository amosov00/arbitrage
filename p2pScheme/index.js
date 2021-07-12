const findBestTrade = require('./fetchP2PData.js')
const {fetchGarantex} = require('./garantex.js')
const garantexTradeFee = 0.0015
const binanceUSDTwidthrawFee = 0.8
async function P2PSchemeCalc(amountRub) {
    const rateUSDT_binance = await findBestTrade(amountRub)
    if (!rateUSDT_binance) {
        return null
    }
    const rateUSDT_garantex = await fetchGarantex()
    const amountUSDT = (amountRub / rateUSDT_binance) - binanceUSDTwidthrawFee
    const rawOutputAmount = amountUSDT * rateUSDT_garantex
    const outputAmount = rawOutputAmount - (rawOutputAmount * garantexTradeFee)
    const invertProcent = 100 - (outputAmount * 100) / amountRub
    const procent = -invertProcent
    return {
        input: amountRub,
        output: outputAmount.toFixed(3).replace(/.$/,''),
        procent: procent.toFixed(5).replace(/.$/,'')
    }
}
module.exports = P2PSchemeCalc
