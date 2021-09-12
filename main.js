(async () => {
    const P2PSchemeCalc = require('./p2pScheme/index.js')
    const {init} = require('./telegram')
    await init(P2PSchemeCalc)
})()





