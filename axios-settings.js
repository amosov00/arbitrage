const axios = require('axios')
const $axios = axios.create({
    timeout: 10000
})

module.exports = $axios