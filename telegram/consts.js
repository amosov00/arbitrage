const buttons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'схема с p2p', callback_data: '/schema/p2p'}],
            [{text: 'схема с юнисвапом', callback_data: '/schema/uniswap'}]
        ]
    })
}

const schemeButtons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'назад', callback_data: '/undo'}, {text: 'Подписаться на уведомления', callback_data: '/subscription'}],
        ]
    })
}


const commands = [
    {command: '/start', description: 'начать работу'},
    {command: '/unsub', description: 'отписаться от всех уведомлений'},
]

//1774568009:AAGnqXodSjjyayxDWNG3zYSfofeAPAwhMwY production
//1936627336:AAEjTSZIO9mwk_myJDAoyUDEFZN1ZLMG6-0 test
const token = '1774568009:AAGnqXodSjjyayxDWNG3zYSfofeAPAwhMwY';

module.exports = {schemeButtons, buttons, commands, token}
