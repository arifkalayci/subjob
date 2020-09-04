const { WsProvider } = require('@polkadot/api');
const { readdirSync, readFileSync } = require('fs');
const path = require('path');

const Runner = require('./Runner');

const { RUNNERS_DIR_NAME } = require('../constants');

class Runners extends Map {
  constructor(channels, socket) {
    super();
    this.channels = channels;
    this.socket = socket;
  }

  load() {
    this.clear();
    const contextVars = {};
    let runnerFiles = readdirSync(RUNNERS_DIR_NAME, { withFileTypes: true }).filter(entry => entry.isFile() && /\.json$/gi.test(entry.name));
    for (let file of runnerFiles) {
      let runnerName = path.parse(file.name).name;
      try {
        let config = JSON.parse(readFileSync(`${RUNNERS_DIR_NAME}/${file.name}`, 'utf-8'));

        const wsProvider = new WsProvider(config.wsProviderUrl, false);

        let runner = new Runner(runnerName, wsProvider, this.channels, this.socket);
        this.set(runnerName, runner);
        contextVars[runnerName] = runner;
      } catch (error) {
        logger.error(`Error ${error.message}. Skipping installing runner '${runnerName}'`);
      }
    }

    return contextVars;
  }
}

module.exports = Runners;
