const { workerData, parentPort } = require('worker_threads')
const P2PSchemeCalc = require('../../p2pScheme/index.js')


async function repeat() {
        console.log('-'.repeat(50))
        const calcResponse = await P2PSchemeCalc(parseInt(workerData.amountIn))
        console.log('получаемый процент', calcResponse.procent)
        console.log('желаемый процент', workerData.procent)
        console.log('-'.repeat(50))
        if (+calcResponse.procent >= +workerData.procent) {
            parentPort.postMessage(calcResponse)
        }
}

(async ()=>{
    while (true) {
        try {
            await repeat()
        } catch (e) {
            console.log('произошла ошибка!!!')
            throw new Error(e)
        }
    }
})()