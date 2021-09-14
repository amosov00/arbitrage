const axios = require('axios')


async function fetchGarantex() {
    try {
        const {data} = await axios.get('https://garantex.io/api/v2/depth', {
            params: {
                market: 'usdtrub'
            }
        })
        return data.asks[0].price
    } catch (e) {
        throw new Error(e)
    }
}

module.exports = {fetchGarantex}
