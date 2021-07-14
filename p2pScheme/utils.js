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
    if (combinationLimit < amountIn) {
        return false
    } else {
        combination.sort((a, b) => +a.price - +b.price)
        for (let i = 0; i < combination.length; i++) {
            const orderLimit = +combination[i].dynamicMaxSingleTransAmount
            const orderRate = +combination[i].price
            const userNo = combination[i].userNo
            const available = combination[i].tradableQuantity
            const nickName = combination[i].nickName
            const objectRate = combination[i]
            balance -= orderLimit
            if (Math.sign(balance) === -1) {
                prices.push({value: (balance + orderLimit) / orderRate, rate: orderRate, available, nickName, objectRate})
                break
            } else if (Math.sign(balance) === 1) {
                prices.push({value: orderLimit / orderRate, rate: orderRate, available, nickName, objectRate})
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

async function sortWorkerCreate(rates) {
    const chunckedRates = _.chunk(rates, rates.length / 100)
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


async function calcMiddlePriceInCombinationWorker(combinations, amountIn) {
    const chunckedCombinations = _.chunk(combinations, combinations.length / 4)
    const promises = []
    chunckedCombinations.forEach((item) => {
        const worker = new Worker('./p2pScheme/workers/calcRatesWorker.js', {workerData: {item, amountIn}});
        const promise = new Promise((resolve)=>{
            worker.on('message',async (message) => {
                await worker.terminate()
                resolve(message)
            });
        })
        promises.push(promise)
    })
    const rawArray = await Promise.all(promises)
    return rawArray.flat()
}

module.exports = {calcMiddlePriceInCombination, sortWorkerCreate, calcMiddlePriceInCombinationWorker}
