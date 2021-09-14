const { workerData, parentPort } = require('worker_threads')
const {cakeCalc} = require('../../cakeSheme/index.js')

async function repeat() {
    let calcResponse
    console.time('скорость обновления')
    try {
        calcResponse = await cakeCalc(parseInt(workerData.amountIn))
    } catch (e) {
        await repeat()
        return
    }
    console.timeEnd('скорость обновления')
    const procent = ((calcResponse * 100) / workerData.amountIn) - 100
    console.log('-'.repeat(50))
    console.log('Cхема с питупи гарой и панкейком(BNB)')
    console.log('calcResponse', calcResponse)
    console.log('real procent', procent)
    console.log('my procent', +workerData.procent)
    console.log('-'.repeat(50))
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