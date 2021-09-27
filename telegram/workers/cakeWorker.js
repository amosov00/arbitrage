const { workerData, parentPort } = require('worker_threads')
const {cakeCalc} = require('../../cakeSheme/index.js')
const {writeError} = require('../../errorHendler/index.js')
let procent = null

async function repeat() {
    try {
        const calcResponse = await cakeCalc(parseInt(workerData.amountIn))
        procent = ((calcResponse.value * 100) / workerData.amountIn) - 100
        if (procent >= +workerData.procent) {
            parentPort.postMessage({
                input: workerData.amountIn,
                output: calcResponse
            })
        }
    } catch (e) {
        console.log(`error from ${workerData.number}`, e)
    }
}

(async ()=>{
    while (true) {
        console.log(`loop ${workerData.number}`, procent)
        await repeat()
    }
})()