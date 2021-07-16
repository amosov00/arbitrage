const {schemeButtons} = require('./consts.js')

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

module.exports = {sendOrders}
