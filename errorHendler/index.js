const fs = require('fs');
const util = require('util');

const appendFile = util.promisify(fs.appendFile);


async function writeError(errorText) {
    await appendFile('errors.txt', `${errorText}\n`);
}

module.exports = {writeError}