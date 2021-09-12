function fetchP2PData(page) {
    return axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
        page,
        rows: 20,
        payTypes: [],
        publisherType: null,
        tradeType: 'SELL',
        fiat: 'RUB',
        asset: 'BNB'
    })
}



module.exports = {fetchP2PData};
