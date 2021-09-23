const { workerData, parentPort } = require('worker_threads')
const P2PSchemeCalc = require('../../p2pScheme/index.js')


async function repeat() {
        console.time('скорость обновления (USDT)')
        const calcResponse = await P2PSchemeCalc(parseInt(workerData.amountIn))
        console.timeEnd('скорость обновления (USDT)')
        console.log('получаемый процент (USDT)', calcResponse.procent)
        console.log('желаемый процент (USDT)', workerData.procent)
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