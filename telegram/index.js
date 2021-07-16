const TelegramBot = require('node-telegram-bot-api');
const { Worker } = require('worker_threads')
const {schemeButtons, buttons, commands, token} = require('./consts.js')
const {sendOrders} = require('./utils.js')


const bot = new TelegramBot(token, {polling: true});


class TelegramState {
    constructor() {
        this.state = {}
    }
    setUser(chatId) {
        this.state[chatId] = {}
        this.state[chatId].workers = []
    }
    setUserOnSchema(chatId, schema) {
        this.state[chatId].schemaPath = schema
    }
    clearPath(chatId) {
        if(this.state[chatId].schemaPath) {
            delete this.state[chatId].schemaPath
        }
    }
    setWorker(chatId, worker, amount, procent) {
        this.state[chatId].workers.push({
            worker,
            amount,
            procent
        })
    }
    setParamsForSub(type, chatId, param) {
        if (type === 'amount') {
            this.state[chatId].amountSub = param
        } else if (type === 'procent') {
            this.state[chatId].procentSub = param
        }
    }
    clearParamsForSub(chatId) {
        delete this.state[chatId].amountSub
        delete this.state[chatId].procentSub
    }
}

const telegramState = new TelegramState()



async function init(P2PSchemeCalc) {
    await bot.setMyCommands(commands)

    bot.on('message', async (event) => {
        switch (event.text) {
            case '/start':
                if (!telegramState.state[event.chat.id]) {
                    telegramState.setUser(event.chat.id)
                }
                telegramState.clearPath(event.chat.id)
                telegramState.clearParamsForSub(event.chat.id)
                await bot.sendMessage(event.chat.id, `выбери схему`, buttons)
                break;
            case '/unsub':
                telegramState.clearParamsForSub(event.chat.id)
                telegramState.clearPath(event.chat.id)
                telegramState.state[event.chat.id].workers.forEach(({worker}) => {
                    worker.terminate()
                })
                telegramState.state[event.chat.id].workers = []
                await bot.sendMessage(event.chat.id, 'вы отписались от всех уведомлений')
                break;
            default:
                if (telegramState.state[event.chat.id].schemaPath === '/schema/p2p') {
                    await bot.sendMessage(event.chat.id, 'Подождите, идёт обработка запроса⚙️⚙️⚙️...')
                    console.time('FirstWay');
                    const calcResponse = await P2PSchemeCalc(parseInt(event.text))
                    console.timeEnd('FirstWay')
                    await sendOrders(calcResponse, event.chat.id, bot)
                    return
                } else if (telegramState.state[event.chat.id].schemaPath === '/schema/p2p/inputSubSum') {
                    telegramState.setParamsForSub('amount', event.chat.id, event.text)
                    telegramState.setUserOnSchema(event.chat.id, '/schema/p2p/inputSubProcent')
                    await bot.sendMessage(event.chat.id, `Введите процент по которому хотите получать уведомления`)
                    return
                } else if (telegramState.state[event.chat.id].schemaPath === '/schema/p2p/inputSubProcent') {
                    telegramState.setParamsForSub('procent', event.chat.id, event.text)
                    telegramState.clearPath(event.chat.id)
                    const worker = new Worker('./telegram/workers/p2pWorker.js', {workerData: {
                        amountIn: telegramState.state[event.chat.id].amountSub,
                        procent: telegramState.state[event.chat.id].procentSub
                    }});
                    worker.on('message',async (message) => {
                        await sendOrders(message, event.chat.id, bot)
                    });
                    telegramState.setWorker(event.chat.id, worker, telegramState.state[event.chat.id].amountSub, telegramState.state[event.chat.id].procentSub)
                    await bot.sendMessage(event.chat.id, `Подписка успешно оформленна, ждите уведомлений`)
                    return
                }
                await bot.sendMessage(event.chat.id, `не корректная команда`)
        }
    })

    bot.on('callback_query', async (event) => {
        switch (event.data) {
            case '/schema/p2p':
                telegramState.setUserOnSchema(event.message.chat.id, '/schema/p2p')
                await bot.sendMessage(event.message.chat.id, `введите сумму\nчто бы посмотреть текущую доходность, либо подпишитесь на схему`, schemeButtons)
                await bot.answerCallbackQuery(event.id)
                break;
            case '/undo':
                telegramState.clearPath(event.message.chat.id)
                await bot.sendMessage(event.message.chat.id, `выбери схему`, buttons)
                await bot.answerCallbackQuery(event.id)
                break;
            case '/subscription':
                if (telegramState.state[event.message.chat.id].schemaPath === '/schema/p2p') {
                    telegramState.setUserOnSchema(event.message.chat.id, '/schema/p2p/inputSubSum')
                    await bot.sendMessage(event.message.chat.id, `Введите сумму на которую хотите подписаться`)
                    await bot.answerCallbackQuery(event.id)
                }
                break;
        }
    })
}

module.exports = {init}

