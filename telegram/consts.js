const buttons = {
    reply_markup: JSON.stringify({
        inline_keyboard: [
            [{text: 'схема с p2p', callback_data: '/schema/p2p'}],
            [{text: 'схема с панкейком', callback_data: '/schema/pancake'}]
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

const token = '2045608837:AAHp_W9sDjRZylV0OmvASdlWdU_thqKMFvg';

module.exports = {schemeButtons, buttons, commands, token}
