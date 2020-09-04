const { readdirSync, readFileSync } = require('fs');
const path = require('path');

const { ACCOUNTS_DIR_NAME } = require('../constants');

class Accounts extends Map {
  load() {
    this.clear();
    const contextVars = {};
    let accountFiles = readdirSync(ACCOUNTS_DIR_NAME, { withFileTypes: true }).filter(entry => entry.isFile());
    for (let file of accountFiles) {
      let accountName = path.parse(file.name).name;
      try {
        let account = readFileSync(`${ACCOUNTS_DIR_NAME}/${file.name}`, 'utf-8').split('\n')[0];

        this.set(accountName, account);
        contextVars[accountName] = account;
      } catch(error) {
        logger.error(`${error.message}. Skipping installing account '${accountName}'.`);
      }
    }

    return contextVars;
  }
}

module.exports = Accounts;
