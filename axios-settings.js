const axios = require('axios')
const $axios = axios.create({
    timeout: 5000,
})

module.exports = $axios