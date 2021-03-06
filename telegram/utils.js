const {schemeButtons} = require('./consts.js')
const {setWorker} = require('../firebase/index.js')
const { Worker } = require('worker_threads')
let workerCounter = 0

async function sendOrders(calcResponse, chatId, bot) {
    if (!calcResponse) {
        await bot.sendMessage(chatId, 'на бинансе нет ордеров по такой сумме')
        return
    }
    const {procent, input, output, binanceOrders} = calcResponse
    for (const order of binanceOrders) {
        await bot.sendMessage(chatId, `№${binanceOrders.indexOf(order) + 1}
            \nДоступно всего: ${order.available} USDT
            \nНадо купить: ${order.value.toFixed(3).replace(/.$/,'')} USDT
            \nКурс ордера: ${order.rate}
            \nНикнейм продавца: ${order.nickName}
        `)
    }
    await bot.sendMessage(chatId, `Cхема с питупи и гарой напрямую (USDT)\nНа входе: ${input}₽\nНа выходе: ${output}₽\nПроцент к банку: ${procent}%`, schemeButtons)
}




async function addNewWorker(chatId, state, bot) {
    workerCounter++


    const worker = new Worker('./telegram/workers/p2pWorker.js', {workerData: {
            amountIn: state.state[chatId].amountSub,
            procent: state.state[chatId].procentSub,
            number: workerCounter
    }});

    worker.on('message',async (message) => {
        await sendOrders(message, chatId, bot)
    });

    state.setWorker(
        chatId,
        worker,
        state.state[chatId].amountSub,
        state.state[chatId].procentSub
    )

    await setWorker(state.state[chatId].amountSub, state.state[chatId].procentSub, chatId, 'p2p_buy-workers')
}


async function addNewCakeWorker(chatId, state, bot) {
    workerCounter++
    const worker = new Worker('./telegram/workers/cakeWorker.js', {workerData: {
            amountIn: state.state[chatId].amountSub,
            procent: state.state[chatId].procentSub,
            number: workerCounter
    }})

    worker.on('message',async (message) => {
        await cakeOutputPerfect(message.input, message.output.value, chatId, bot, message.output.orders)
    })

    state.setWorker(
        chatId,
        worker,
        state.state[chatId].amountSub,
        state.state[chatId].procentSub
    )

    await setWorker(state.state[chatId].amountSub, state.state[chatId].procentSub, chatId, 'cake-workers')
}




async function initOldWorkers(amount, procent, chatId, state, bot, workerName) {
    workerCounter++
    const worker = new Worker(`./telegram/workers/${workerName}.js`, {workerData: {
            amountIn: amount,
            procent,
            number: workerCounter
        }});
    worker.on('message',async (message) => {
        await sendOrders(message, chatId, bot)
    });
    state.setWorker(
        chatId,
        worker,
        amount,
        procent
    )
}


async function cakeOutputPerfect(input, output, chatId, bot, orders) {
    const procent = ((output * 100) / input) - 100
    for (const order of orders) {
        await bot.sendMessage(chatId, `№${orders.indexOf(order) + 1}
            \nДоступно всего: ${order.available} BNB
            \nНадо купить: ${order.value.toFixed(3).replace(/.$/,'')} BNB
            \nКурс ордера: ${order.rate}
            \nНикнейм продавца: ${order.nickName}
        `)
    }
    await bot.sendMessage(chatId, `Cхема с питупи гарой и панкейком(BNB)\nНа входе: ${input}₽\nНа выходе: ${output}₽\nПроцент к банку: ${procent}%`, schemeButtons)
}

module.exports = {sendOrders, addNewWorker, initOldWorkers, cakeOutputPerfect, addNewCakeWorker}
