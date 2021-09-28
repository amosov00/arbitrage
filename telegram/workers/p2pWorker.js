const { workerData, parentPort } = require('worker_threads')
const P2PSchemeCalc = require('../../p2pScheme/index.js')
let procent = null

async function repeat() {
    try {
        const calcResponse = await P2PSchemeCalc(parseInt(workerData.amountIn))
        if (+calcResponse.procent >= +workerData.procent) {
            parentPort.postMessage(calcResponse)
        }
        procent = +calcResponse.procent
    } catch (e) {
        console.log(`loop ${workerData.number} error`, e)
    }
}

(async ()=>{
    while (true) {
        console.log(`loop ${workerData.number}`, procent)
        await repeat()
    }
})()