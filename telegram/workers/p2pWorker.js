const { workerData, parentPort } = require('worker_threads')
const P2PSchemeCalc = require('../../p2pScheme/index.js')


async function repeat() {
        const calcResponse = await P2PSchemeCalc(parseInt(workerData.amountIn))
        console.log(`cхема 1. Процент желаемый: ${workerData.procent}. Процент ревльный: ${calcResponse.procent}`)
        if (+calcResponse.procent >= +workerData.procent) {
            parentPort.postMessage(calcResponse)
        }
}

(async ()=>{
    while (true) {
        try {
            await repeat()
        } catch (e) {
            await repeat()
            console.log(e)
        }
    }
})()