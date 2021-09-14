const axios = require('axios')

async function getBNBFee() {
    try {
        const {data} = await axios.get('https://gbsc.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle')
        return data.result.FastGasPrice / 1000000000
    } catch (e) {
        throw new Error(e)
    }
}

module.exports = {getBNBFee}