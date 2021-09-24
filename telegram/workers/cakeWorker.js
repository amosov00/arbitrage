const { workerData, parentPort } = require('worker_threads')
const {cakeCalc} = require('../../cakeSheme/index.js')

async function repeat() {
    const calcResponse = await cakeCalc(parseInt(workerData.amountIn))
    const procent = ((calcResponse.value * 100) / workerData.amountIn) - 100
    console.log('Cхема с питупи гарой и панкейком(BNB)')
    console.log('calcResponse', calcResponse.value)
    console.log('real procent', procent)
    console.log('my procent', +workerData.procent)
    if (procent >= +workerData.procent) {
        parentPort.postMessage({
            input: workerData.amountIn,
            output: calcResponse
        })
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