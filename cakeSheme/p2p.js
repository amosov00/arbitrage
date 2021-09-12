const axios = require('axios')
function fetchP2PData() {
    return axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
        page: 1,
        rows: 10,
        payTypes: [],
        publisherType: null,
        tradeType: 'SELL',
        fiat: 'RUB',
        asset: 'BNB'
    })
}

function filterP2P(data) {
 return data[0].adv.price
}



module.exports = {fetchP2PData, filterP2P};
