const { workerData, parentPort } = require('worker_threads')
const {cakeCalc} = require('../../cakeSheme/index.js')

async function repeat() {
    let calcResponse
    console.time('скорость обновления (BNB)')
    try {
        calcResponse = await cakeCalc(parseInt(workerData.amountIn))
    } catch (e) {
        await repeat()
        return
    }
    console.timeEnd('скорость обновления (BNB)')
    const procent = ((calcResponse.value * 100) / workerData.amountIn) - 100
    console.log('calcResponse', calcResponse.value)
    console.log('получаемый процент (BNB)', procent)
    console.log('желаемый процент (BNB)', +workerData.procent)
    if (procent >= +workerData.procent) {
        parentPort.postMessage({
            input: workerData.amountIn,
            output: calcResponse
        })
    }
}

(async ()=>{
    while (true) {
        await repeat()
    }
})()