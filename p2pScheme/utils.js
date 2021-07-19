const { Worker } = require('worker_threads')
const _ = require('lodash')
function calcMiddlePriceInCombination(combination, amountIn) {
    let combinationLimit = 0
    let amountOut = 0
    let balance = amountIn
    const prices = []
    combination.forEach(item => {
        combinationLimit += +item.dynamicMaxSingleTransAmount
    })
    combination.sort((a, b) => +a.price - +b.price)
    for (let i = 0; i < combination.length; i++) {
        const orderLimit = +combination[i].dynamicMaxSingleTransAmount
        const orderRate = +combination[i].price
        const advNo = combination[i].advNo
        const available = combination[i].dynamicMaxSingleTransQuantity
        const nickName = combination[i].nickName
        balance -= orderLimit
        if (Math.sign(balance) === -1) {
            prices.push({value: (balance + orderLimit) / orderRate, rate: orderRate, advNo, available, nickName})
            break
        } else if (Math.sign(balance) === 1) {
            prices.push({value: orderLimit / orderRate, rate: orderRate, advNo, available, nickName})
        } else if (Math.sign(balance) === 0) {
            prices.push({value: orderLimit / orderRate, rate: orderRate, advNo, available, nickName})
            break
        }
    }

    prices.forEach(({value})=> {
        amountOut += value
    })

    return {
        price: amountIn / amountOut,
        prices
    }
}

async function sortWorkerCreate(rates) {
    const chunckedRates = _.chunk(rates, rates.length / 15)
    const promises = []
    chunckedRates.forEach((item, index) => {
        const worker = new Worker('./p2pScheme/workers/sortWorker.js', {workerData: {item, index}});
        const promise = new Promise((resolve)=>{
            worker.on('message',async (message) => {
                await worker.terminate()
                resolve(message)
            });
        })
        promises.push(promise)
    })
    return await Promise.all(promises)
}




module.exports = {calcMiddlePriceInCombination, sortWorkerCreate}
