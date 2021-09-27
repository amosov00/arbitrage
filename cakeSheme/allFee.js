const axios = require('../axios-settings.js')

async function getBNBFee() {
        const {data} = await axios.get('https://gbsc.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle')
        return data.result.FastGasPrice / 1000000000
}

module.exports = {getBNBFee}