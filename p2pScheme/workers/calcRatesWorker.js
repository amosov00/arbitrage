const {calcMiddlePriceInCombination} = require("../utils")
const { workerData, parentPort } = require('worker_threads')

const output = []

workerData.item.forEach((item) => {
    const response = calcMiddlePriceInCombination(item, workerData.amountIn)
    if (response) {
        output.push(response)
    }
})

parentPort.postMessage(output)
