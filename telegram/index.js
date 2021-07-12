const TelegramBot = require('node-telegram-bot-api');
const {schemeButtons, buttons, commands, token} = require('./consts.js')


const bot = new TelegramBot(token, {polling: true});


class TelegramState {
    constructor() {
        this.state = {}
    }
    setUserOnSchema(chatId, schema) {
        this.state[chatId] = schema
    }
    clearState(chatId) {
        if(this.state[chatId]) {
            delete this.state[chatId]
        }
    }
}

const telegramState = new TelegramState()



async function init(P2PSchemeCalc) {
    await bot.setMyCommands(commands)

    bot.on('message', async (event) => {
        switch (event.text) {
            case '/start':
                telegramState.clearState(event.chat.id)
                await bot.sendMessage(event.chat.id, `выбери схему`, buttons)
                break;
            case '/unsub':
                telegramState.clearState(event.chat.id)
                console.log('отписаться от всего');
                break;
            default:
                if (telegramState.state[event.chat.id] === '/schema/p2p') {
                    console.time('FirstWay');
                    const calcResponse = await P2PSchemeCalc(parseInt(event.text))
                    console.timeEnd('FirstWay')
                    if (!calcResponse) {
                        await bot.sendMessage(event.chat.id, 'нет ордеров по такой цене')
                        return
                    }
                    const {procent, input, output} = calcResponse
                    await bot.sendMessage(event.chat.id, `На входе: ${input}₽\nНа выходе: ${output}₽\nПроцент к банку: ${procent}%`, schemeButtons)
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
                telegramState.clearState(event.message.chat.id)
                await bot.sendMessage(event.message.chat.id, `выбери схему`, buttons)
                await bot.answerCallbackQuery(event.id)
                break;
        }
    })
}

module.exports = init

