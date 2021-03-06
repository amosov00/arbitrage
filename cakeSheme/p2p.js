const axios = require('../axios-settings.js')
function fetchP2PData() {
        return axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
            page: 1,
            rows: 20,
            payTypes: [],
            publisherType: null,
            tradeType: 'SELL',
            fiat: 'RUB',
            asset: 'BNB'
        })
}

function filterP2P(data) {
    for (let i = 0; i < data.length; i++) {
        if (parseInt(data[i].adv.maxSingleTransAmount) >= 90000) {
            return data[i].adv.price
        }
    }
}



module.exports = {fetchP2PData, filterP2P};
