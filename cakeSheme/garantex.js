const axios = require('axios')


async function fetchGarantex() {
        const {data} = await axios.get('https://garantex.io/api/v2/depth', {
            params: {
                market: 'usdtrub'
            }
        })
        return data.asks[0].price
}

module.exports = {fetchGarantex}
