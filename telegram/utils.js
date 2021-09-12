const {schemeButtons} = require('./consts.js')
const {setWorker} = require('../firebase/index.js')
const { Worker } = require('worker_threads')

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
    await bot.sendMessage(chatId, `На входе: ${input}₽\nНа выходе: ${output}₽\nПроцент к банку: ${procent}%`, schemeButtons)
}

async function addNewWorker(chatId, state, bot) {
    const worker = new Worker('./telegram/workers/p2pWorker.js', {workerData: {
            amountIn: state.state[chatId].amountSub,
            procent: state.state[chatId].procentSub
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
    await setWorker(state.state[chatId].amountSub, state.state[chatId].procentSub, chatId)
}

async function initOldWorkers(amount, procent, chatId, state, bot) {
    const worker = new Worker('./telegram/workers/p2pWorker.js', {workerData: {
            amountIn: amount,
            procent
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


async function cakeOutputPerfect(input, output, chatId, bot) {
    const procent = ((output * 100) / input) - 100
    await bot.sendMessage(chatId, `На входе: ${input}₽\nНа выходе: ${output}₽\nПроцент к банку: ${procent}%`, schemeButtons)
}

module.exports = {sendOrders, addNewWorker, initOldWorkers, cakeOutputPerfect}
