const puppeteer = require('puppeteer')

const getLink = (amount) => `https://garantex.io/otc?utf8=%E2%9C%93&q%5Bpayment_method_cont%5D=%D1%82%D0%B8%D0%BD%D1%8C%D0%BA%D0%BE%D1%84%D1%84&amount=${amount}&permitted_only=1&commit=%D0%9F%D0%BE%D0%B8%D1%81%D0%BA`

async function getWithdrawFee() {
    const browser = await puppeteer.launch();
    const getLink = () => `https://garantex.io/otc?utf8=✓&q%5Bpayment_method_cont%5D=тинькофф&amount=300000&permitted_only=1&commit=Поиск`


    const page = await browser.newPage();
    await page.goto(getLink(), {waitUntil: 'domcontentloaded'});

    const cell = await page.$('.buy_table>tbody>tr>td~td~td')
    const rawFee = await cell.evaluate(node => node.innerText)
    await browser.close();
    return parseFloat(rawFee)
}

module.exports = getWithdrawFee
