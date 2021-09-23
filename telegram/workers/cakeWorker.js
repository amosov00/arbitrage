const { workerData, parentPort } = require('worker_threads')
const {cakeCalc} = require('../../cakeSheme/index.js')

async function repeat() {
    let calcResponse
    try {
        calcResponse = await cakeCalc(parseInt(workerData.amountIn))
    } catch (e) {
        //await bot.sendMessage(234, '234')
        await repeat()
        return
    }
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
        await repeat()
    }
})()