const { readdirSync, readFileSync } = require('fs');
const path = require('path');

class Accounts extends Map {
  constructor(context) {
    super();
    this.context = context;
  }

  load() {
    this.clear();

    let accountFiles = readdirSync('accounts', { withFileTypes: true }).filter(entry => entry.isFile());
    for (let file of accountFiles) {
      let accountName = path.parse(file.name).name;
      try {
        let account = readFileSync(`accounts/${file.name}`, 'utf-8').split('\n')[0];

        this.context[accountName] = account;
        this.set(accountName, account);
      } catch(error) {
        console.info(`Error: ${error.message}. Skipping installing account '${accountName}'.`);
      }
    }

    this.context['accounts'] = this;
  }
}

module.exports = Accounts;
