const { workerData, parentPort } = require('worker_threads')
const {cakeCalc} = require('../../cakeSheme/index.js')

async function repeat() {
    await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 1200)})
    console.time('скорость обновления')
    const calcResponse = await cakeCalc(parseInt(workerData.amountIn))
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