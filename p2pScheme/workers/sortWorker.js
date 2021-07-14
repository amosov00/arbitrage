const { workerData, parentPort } = require('worker_threads')


workerData.item.sort((a, b)=> {
    return a.price - b.price
})


parentPort.postMessage(workerData.item[0])
