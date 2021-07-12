process.on("message", ({allCombinationOfFour, amountIn}) => {
    const {calcMiddlePriceInCombination} = require("../utils.js")
    const rates = []
    allCombinationOfFour.forEach((item, index) => {
        console.log(index, 'calculate middle price allCombinationOfFour 3')
        const response = calcMiddlePriceInCombination(item, amountIn)
        if (response) {
            rates.push(response)
        }
    })
    process.send(rates)
})
