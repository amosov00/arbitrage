const https = require("https");
const {sortWorkerCreate, calcMiddlePriceInCombination} = require("./utils.js")

function fetchP2PData(page) {
    return new Promise((resolve, reject) => {
        const baseObj = {
            page,
            rows: 20,
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
    for (let i = 1; i <= 3; i++) {
        const {data} = await fetchP2PData(i)
        allOffers = [...allOffers, ...data]
    }
    return allOffers
}


async function lowCalc(amountIn, limitCombination = 4) {
    const rawAdvs = await fetchAllData()
    const completeAdvs = []
    const advs = rawAdvs
        .filter(e => {
            const isConfirmMethods = []
            const confirmMethods = ['Tinkoff', 'SBP', 'Sberbank']
            e.adv.tradeMethods.forEach((method) => {
                if (confirmMethods.includes(method.payType)) {
                    isConfirmMethods.push(true)
                } else {
                    isConfirmMethods.push(false)
                }
            })
            return isConfirmMethods.includes(true)
        })
        .filter(e => e.adv.minSingleTransAmount <= amountIn)
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
    if (advs.length === 0) {
        return false
    }
    for (let limitCombinationNumber = 1; limitCombinationNumber <= limitCombination; limitCombinationNumber++) {
        if (limitCombinationNumber === 1) {
            let i = 0
            while (true) {
                if (advs[i].minSingleTransAmount < amountIn && advs[i].dynamicMaxSingleTransAmount > amountIn) {
                    completeAdvs.push(calcMiddlePriceInCombination([advs[i]], amountIn))
                    break
                }
                if (i === advs.length - 1) {
                    break
                }
                i++
            }
        } else if (limitCombinationNumber === 2) {
            let index1 = 0
            let index2 = 1
            while (true) {
                let balance = amountIn
                const combination = [advs[index1], advs[index2]]
                combination.every((item) => {
                    if (item.minSingleTransAmount <= balance) {
                        balance -= item.dynamicMaxSingleTransAmount
                        if ((balance === 0 || Math.sign(balance) === -1) && item.advNo !== combination[1].advNo) {
                            if (index2 === advs.length - 1) {
                                index1++
                                index2 = index1 + 1
                            } else {
                                index2++
                            }
                            return false
                        } else if (Math.sign(balance) === 1 && item.advNo === combination[1].advNo) {
                            if (index2 === advs.length - 1) {
                                index1++
                                index2 = index1 + 1
                            } else {
                                index2++
                            }
                            return false
                        } else if ((balance === 0 || Math.sign(balance) === -1) && item.advNo === combination[1].advNo) {
                            completeAdvs.push(calcMiddlePriceInCombination(combination, amountIn))
                            index1++
                            index2 = index1 + 1
                        } else if (Math.sign(balance) === 1 && item.advNo !== combination[1].advNo) {
                            return true
                        }
                    } else {
                        if (index2 === advs.length - 1) {
                            index1++
                            index2 = index1 + 1
                        } else {
                            index2++
                        }
                    }
                })
                if (index1 === advs.length - 2 && index2 === advs.length - 1) {
                    break
                }
            }
        } else if (limitCombinationNumber === 3) {
            let index1 = 0
            let index2 = 1
            let index3 = 2
            while (true) {
                let balance = amountIn
                const combination = [advs[index1], advs[index2], advs[index3]]
                combination.every((item) => {
                    if (item.minSingleTransAmount <= balance) {
                        balance -= +item.dynamicMaxSingleTransAmount
                        if ((balance === 0 || Math.sign(balance) === -1) && item.advNo !== combination[2].advNo) {
                            if (index2 === advs.length - 2 && index3 === advs.length - 1) {
                                index1++
                                index2 = index1 + 1
                                index3 = index2 + 1
                            } else if (index3 === advs.length - 1) {
                                index2++
                                index3 = index2 + 1
                            } else {
                                index3++
                            }
                            return false
                        } else if (Math.sign(balance) === 1 && item.advNo === combination[2].advNo) {
                            if (index2 === advs.length - 2 && index3 === advs.length - 1) {
                                index1++
                                index2 = index1 + 1
                                index3 = index2 + 1
                            } else if (index3 === advs.length - 1) {
                                index2++
                                index3 = index2 + 1
                            } else {
                                index3++
                            }
                            return false
                        } else if ((balance === 0 || Math.sign(balance) === -1) && item.advNo === combination[2].advNo) {
                            completeAdvs.push(calcMiddlePriceInCombination(combination, amountIn))
                            if (index2 === advs.length - 2 && index3 === advs.length - 1) {
                                index1++
                                index2 = index1 + 1
                                index3 = index2 + 1
                            } else if (index3 === advs.length - 1) {
                                index2++
                                index3 = index2 + 1
                            } else {
                                index3++
                            }
                        } else if (Math.sign(balance) === 1 && item.advNo !== combination[2].advNo) {
                            return true
                        }
                    } else {
                        if (index2 === advs.length - 2 && index3 === advs.length - 1) {
                            index1++
                            index2 = index1 + 1
                            index3 = index2 + 1
                        } else if (index3 === advs.length - 1) {
                            index2++
                            index3 = index2 + 1
                        } else {
                            index3++
                        }
                    }
                })
                if (index1 === advs.length - 3 && index2 === advs.length - 2 && index3 === advs.length - 1) {
                    break
                }
            }
        } else if (limitCombinationNumber === 4) {
            let index1 = 0
            let index2 = 1
            let index3 = 2
            let index4 = 3
            while (true) {
                let balance = amountIn
                const combination = [advs[index1], advs[index2], advs[index3], advs[index4]]
                combination.every((item) => {
                    if (item.minSingleTransAmount <= balance) {
                        balance -= +item.dynamicMaxSingleTransAmount
                        if ((balance === 0 || Math.sign(balance) === -1) && item.advNo !== combination[3].advNo) {
                            if (index2 === advs.length - 3 && index3 === advs.length - 2 && index4 === advs.length - 1) {
                                index1++
                                index2 = index1 + 1
                                index3 = index2 + 1
                                index4 = index3 + 1
                            } else if (index3 === advs.length - 2 && index4 === advs.length - 1) {
                                index2++
                                index3 = index2 + 1
                                index4 = index3 + 1
                            } else if (index4 === advs.length - 1) {
                                index3++
                                index4 = index3 + 1
                            } else {
                                index4++
                            }
                            return false
                        } else if (Math.sign(balance) === 1 && item.advNo === combination[3].advNo) {
                            if (index2 === advs.length - 3 && index3 === advs.length - 2 && index4 === advs.length - 1) {
                                index1++
                                index2 = index1 + 1
                                index3 = index2 + 1
                                index4 = index3 + 1
                            } else if (index3 === advs.length - 2 && index4 === advs.length - 1) {
                                index2++
                                index3 = index2 + 1
                                index4 = index3 + 1
                            } else if (index4 === advs.length - 1) {
                                index3++
                                index4 = index3 + 1
                            } else {
                                index4++
                            }
                            return false
                        } else if ((balance === 0 || Math.sign(balance) === -1) && item.advNo === combination[3].advNo) {
                            completeAdvs.push(calcMiddlePriceInCombination(combination, amountIn))
                            if (index2 === advs.length - 3 && index3 === advs.length - 2 && index4 === advs.length - 1) {
                                index1++
                                index2 = index1 + 1
                                index3 = index2 + 1
                                index4 = index3 + 1
                            } else if (index3 === advs.length - 2 && index4 === advs.length - 1) {
                                index2++
                                index3 = index2 + 1
                                index4 = index3 + 1
                            } else if (index4 === advs.length - 1) {
                                index3++
                                index4 = index3 + 1
                            } else {
                                index4++
                            }
                        } else if (Math.sign(balance) === 1 && item.advNo !== combination[3].advNo) {
                            return true
                        }
                    } else {
                        if (index2 === advs.length - 3 && index3 === advs.length - 2 && index4 === advs.length - 1) {
                            index1++
                            index2 = index1 + 1
                            index3 = index2 + 1
                            index4 = index3 + 1
                        } else if (index3 === advs.length - 2 && index4 === advs.length - 1) {
                            index2++
                            index3 = index2 + 1
                            index4 = index3 + 1
                        } else if (index4 === advs.length - 1) {
                            index3++
                            index4 = index3 + 1
                        } else {
                            index4++
                        }
                    }
                })
                if (index1 === advs.length - 4 && index2 === advs.length - 3 && index3 === advs.length - 2 && index4 === advs.length - 1) {
                    break
                }
            }
        }
    }
    console.log(completeAdvs.length)
    const completeRates = await sortWorkerCreate(completeAdvs)
    completeRates.sort((a, b)=> {
        return a.price - b.price
    })
    return completeRates[0]
}




module.exports = {lowCalc};
