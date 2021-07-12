const https = require("https");
const _ = require("lodash")
const { Worker } = require('worker_threads')
const {fork} = require('child_process')
const {calcMiddlePriceInCombination} = require("./utils.js")

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


async function fetchAllData(amountIn) {
    let allOffers = []
    for (let i = 1; i <= 3; i++) {
        console.log(i, '/', 3)
        const {data} = await fetchP2PData(i)
        allOffers = [...allOffers, ...data]
    }
    return allOffers
}


async function findBestTrade(amountIn) {
    const rawAdvs = await fetchAllData(amountIn)
    const allAdvs = rawAdvs.filter(e => e.adv.minSingleTransAmount <= amountIn)
        .map(e => e.adv)
    const allCombinationOfTwo = []
    const allCombinationOfThree = []
    const allCombinationOfFour = []


    const usedCombinationsOfTwo = []
    const usedCombinationsOfThree = []

    const rates = []

    if (allAdvs.length === 0) {
        return null
    }
    allAdvs.forEach((item, index) => {
        allAdvs.forEach((i, ind) => {
            console.log('generate all combination of two', `${index} / ${allAdvs.length}`, ind)
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
            console.log('generate all combination of three', `${index} / ${allCombinationOfTwo.length}`, ind)
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
            console.log('generate all combination of four', `${index}/${allCombinationOfThree.length}`, ind)
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
        console.log(index, 'calculate middle price allAdvs')
        if (item.dynamicMaxSingleTransAmount > amountIn) {
            rates.push(item)
        }
    })
    allCombinationOfTwo.forEach((item, index) => {
        console.log(index, 'calculate middle price allCombinationOfTwo')
        const response = calcMiddlePriceInCombination(item, amountIn)
        if (response) {
            rates.push(response)
        }
    })
    allCombinationOfThree.forEach((item, index) => {
        console.log(index, 'calculate middle price allCombinationOfThree')
        const response = calcMiddlePriceInCombination(item, amountIn)
        if (response) {
            rates.push(response)
        }
    })

   // allCombinationOfFour.forEach((item, index) => {
   //      console.log(index, 'calculate middle price allCombinationOfFour')
   //      const response = calcMiddlePriceInCombination(item, amountIn)
   //      if (response) {
   //          rates.push(response)
   //      }
   //  })
    const allCombinationOfFourChuncked = _.chunk(allCombinationOfFour, Math.floor(allCombinationOfFour.length / 4))

    const worker1 = fork('./p2pScheme/workers/process1.js');
    const worker2 = fork('./p2pScheme/workers/process2.js');
    const worker3 = fork('./p2pScheme/workers/process3.js');
    const worker4 = fork('./p2pScheme/workers/process4.js');
    worker1.send({
        allCombinationOfFour: allCombinationOfFourChuncked[0],
        amountIn
    })
    worker2.send({
        allCombinationOfFour: allCombinationOfFourChuncked[1],
        amountIn
    })
    worker3.send({
        allCombinationOfFour: allCombinationOfFourChuncked[2],
        amountIn
    })
    worker4.send({
        allCombinationOfFour: allCombinationOfFourChuncked[3],
        amountIn
    })
    const pomise1 = () => {
        return new Promise((resolve) => {
            worker1.on('message', (e) => {
                resolve(e)
            });
        })
    }
    const pomise2 = () => {
        return new Promise((resolve) => {
            worker2.on('message', (e) => {
                resolve(e)
            });
        })
    }
    const pomise3 = () => {
        return new Promise((resolve) => {
            worker3.on('message', (e) => {
                resolve(e)
            });
        })
    }
    const pomise4 = () => {
        return new Promise((resolve) => {
            worker4.on('message', (e) => {
                resolve(e)
            });
        })
    }


    const [pomise1Response, pomise2Response, pomise3Response, pomise4Response] = await Promise.all([pomise1(), pomise2(), pomise3(), pomise4()])

    rates.push(...pomise1Response, ...pomise2Response, ...pomise3Response, ...pomise4Response)

    rates.sort((a, b)=> {
        console.log(`sorting all complete combinations`)
        return a.price - b.price
    })
    return rates[0].price
}

module.exports = findBestTrade;
