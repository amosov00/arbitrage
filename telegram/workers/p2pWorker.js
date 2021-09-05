const { workerData, parentPort } = require('worker_threads')
const P2PSchemeCalc = require('../../p2pScheme/index.js')


async function repeat() {
        console.log('-'.repeat(50))
        console.log(new Date().toLocaleString('ru', {
            timeZone: 'Europe/Moscow'
        }))
        console.time('скорость обновления')
        const calcResponse = await P2PSchemeCalc(parseInt(workerData.amountIn))
        console.timeEnd('скорость обновления')
        if (!calcResponse) {
            parentPort.postMessage(calcResponse)
        } else {
            console.log('получаемый процент', calcResponse.procent)
            console.log('желаемый процент', workerData.procent)
            console.log('-'.repeat(50))
            if (+calcResponse.procent >= +workerData.procent) {
                parentPort.postMessage(calcResponse)
            }
        }
}

(async ()=>{
    while (true) {
        let ram = process.memoryUsage();
        let ramRss = Math.round(ram.rss / 1024 / 1024 * 100) / 100;
        console.log("RAM: " + ramRss + " MB");
        await repeat()
    }
})()