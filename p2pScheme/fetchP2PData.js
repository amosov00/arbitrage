const https = require("https");
const {sortWorkerCreate, calcMiddlePriceInCombinationWorker} = require("./utils.js")

function fetchP2PData(page) {
    return new Promise((resolve, reject) => {
        const baseObj = {
            page,
            rows: 10,
            payTypes: [],
            publisherType: null,
            tradeType: 'BUY',
            fiat: 'RUB',
            asset: 'USDT',
        };

        const stringData = JSON.stringify(baseObj);
        const options = {
            hostname: "p2p.binance.com",
            port: 443,
            path: "/bapi/c2c/v2/friendly/c2c/adv/search",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": stringData.length,
            },
        };

        const req = https.request(options, (res) => {
            let output = "";
            res.on("data", (d) => {
                output += d;
            });

            res.on("end", () => {
                try {
                    const jsonOuput = JSON.parse(output)
                    resolve(jsonOuput)
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on("error", (error) => {
            reject(error);
        });

        req.write(stringData);
        req.end();
    });
}


async function fetchAllData() {
    let allOffers = []
    for (let i = 1; i <= 4; i++) {
        //console.log(i, '/', 3)
        const {data} = await fetchP2PData(i)
        allOffers = [...allOffers, ...data]
    }
    return allOffers
}


async function findBestTrade(amountIn) {
    const rawAdvs = await fetchAllData(amountIn)
    const allAdvs = rawAdvs.filter(e => e.adv.minSingleTransAmount <= amountIn)
        .map(e => {
            e.adv.nickName = e.advertiser.nickName
            e.adv.userNo = e.advertiser.userNo
            e.adv.prices = [{
                value: +e.adv.dynamicMaxSingleTransAmount / +e.adv.price,
                rate: e.adv.price,
                available: e.adv.tradableQuantity,
                nickName: e.adv.nickName,
            }]
            return e.adv
        })
    const allCombinationOfTwo = []
    const allCombinationOfThree = []
    const allCombinationOfFour = []


    const usedCombinationsOfTwo = []
    const usedCombinationsOfThree = []

    const rates = []

    if (allAdvs.length === 0) {
        return {
            price: null,
            prices: null
        }
    }
    allAdvs.forEach((item, index) => {
        allAdvs.forEach((i, ind) => {
            //console.log('generate all combination of two', `${index} / ${allAdvs.length}`, ind)
            if (i.advNo !== item.advNo) {
                let alreadyUsed = false
                usedCombinationsOfTwo.forEach((numbers)=>{
                    if (numbers.includes(i.advNo) && numbers.includes(item.advNo)) {
                        alreadyUsed = true
                    }
                })
                if (!alreadyUsed) {
                    usedCombinationsOfTwo.push([i.advNo, item.advNo])
                    allCombinationOfTwo.push([
                        item,
                        i
                    ])
                }
            }
        })
    })
    allCombinationOfTwo.forEach((item, index) => {
        allAdvs.forEach((i, ind) => {
            //console.log('generate all combination of three', `${index} / ${allCombinationOfTwo.length}`, ind)
            if ((i.advNo !== item[0].advNo) && (i.advNo !== item[1].advNo)) {
                let alreadyUsed = false
                usedCombinationsOfThree.forEach((numbers)=>{
                    if (numbers.includes(i.advNo) && numbers.includes(item[0].advNo) && numbers.includes(item[1].advNo)) {
                        alreadyUsed = true
                    }
                })
                if (!alreadyUsed) {
                    usedCombinationsOfThree.push([i.advNo, item[0].advNo, item[1].advNo])
                    allCombinationOfThree.push(
                        [
                            ...item,
                            i
                        ]
                    )
                }
            }
        })
    })
    allCombinationOfThree.forEach((item, index) => {
        allAdvs.forEach((i, ind) => {
            //console.log('generate all combination of four', `${index}/${allCombinationOfThree.length}`, ind)
            if ((i.advNo !== item[0].advNo) && (i.advNo !== item[1].advNo) && (i.advNo !== item[2].advNo)) {
                allCombinationOfFour.push(
                    [
                        ...item,
                        i
                    ]
                )
            }
        })
    })
    allAdvs.forEach((item, index) => {
        //console.log(index, 'calculate middle price allAdvs')
        if (item.dynamicMaxSingleTransAmount > amountIn) {
            rates.push(item)
        }
    })
    rates.push(...await calcMiddlePriceInCombinationWorker(allCombinationOfTwo, amountIn))
    rates.push(...await calcMiddlePriceInCombinationWorker(allCombinationOfThree, amountIn))
    rates.push(...await calcMiddlePriceInCombinationWorker(allCombinationOfFour, amountIn))

    if (rates.length === 0) {
        return {
            price: null,
            prices: null
        }
    }
    const completeRates = await sortWorkerCreate(rates)
    completeRates.sort((a, b)=> {
        //console.log(`sorting all complete combinations`)
        return a.price - b.price
    })
    return completeRates[0]
}

module.exports = findBestTrade;
