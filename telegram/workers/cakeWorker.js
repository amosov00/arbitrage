const { workerData, parentPort } = require('worker_threads')
const {cakeCalc} = require('../../cakeSheme/index.js')
const {bot} =  require('../index.js')

async function repeat() {
    let calcResponse
    console.log('-'.repeat(50))
    console.time('скорость обновления')
    try {
        calcResponse = await cakeCalc(parseInt(workerData.amountIn))
    } catch (e) {
        //await bot.sendMessage(234, '234')
        await repeat()
        return
    }
    console.timeEnd('скорость обновления')
    const procent = ((calcResponse.value * 100) / workerData.amountIn) - 100
    console.log('Cхема с питупи гарой и панкейком(BNB)')
    console.log('calcResponse', calcResponse.value)
    console.log('real procent', procent)
    console.log('my procent', +workerData.procent)
    console.log('-'.repeat(50))
    if (procent >= +workerData.procent) {
        parentPort.postMessage({
            input: workerData.amountIn,
            output: calcResponse.value
        })
    }
}

(async ()=>{
    while (true) {
        await repeat()
    }
})()