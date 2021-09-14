const {PancakeswapPair} = require('simple-pancakeswap-sdk')

const pancakeswapPair = new PancakeswapPair({
    fromTokenContractAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    toTokenContractAddress: '0x55d398326f99059ff775485246999027b3197955',
    ethereumAddress: '0xBA6670261a05b8504E8Ab9c45D97A8eD42573822',
});



async function pancakeTrade(amount) {
    try {
        const pancakeswapPairFactory = await pancakeswapPair.createFactory();
        const trade = await pancakeswapPairFactory.trade(`${amount}`);
        return trade.expectedConvertQuote
    } catch (e) {
        throw new Error(e)
    }
}


module.exports = {pancakeTrade}