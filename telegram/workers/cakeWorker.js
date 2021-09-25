const { workerData, parentPort } = require('worker_threads')
const {cakeCalc} = require('../../cakeSheme/index.js')

async function repeat() {
    const calcResponse = await cakeCalc(parseInt(workerData.amountIn))
    const procent = ((calcResponse.value * 100) / workerData.amountIn) - 100
    console.log(`cхема 2. Процент желаемый: ${workerData.procent}. Процент ревльный: ${procent}`)
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
            //await repeat()
            console.log(e)
        }
    }
})()