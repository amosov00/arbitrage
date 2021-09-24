const { workerData, parentPort } = require('worker_threads')
const P2PSchemeCalc = require('../../p2pScheme/index.js')


async function repeat() {
        const calcResponse = await P2PSchemeCalc(parseInt(workerData.amountIn))
        console.log('получаемый процент', calcResponse.procent)
        console.log('желаемый процент', workerData.procent)
        if (+calcResponse.procent >= +workerData.procent) {
            parentPort.postMessage(calcResponse)
        }
}

(async ()=>{
    while (true) {
        try {
            await repeat()
        } catch (e) {
            throw new Error(e)
        }
    }
})()