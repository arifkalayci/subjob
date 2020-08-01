const { WsProvider } = require('@polkadot/api');
const { readdirSync, readFileSync } = require('fs');
const path = require('path');

const winston = require('winston');

const Runner = require('./Runner');

class Runners extends Map {
  constructor(context, channels, socket) {
    super();
    this.context = context;
    this.channels = channels;
    this.socket = socket;
  }

  load() {
    this.clear();

    let runnerFiles = readdirSync('runners', { withFileTypes: true }).filter(entry => entry.isFile() && /\.json$/gi.test(entry.name));
    for (let file of runnerFiles) {
      let runnerName = path.parse(file.name).name;
      try {
        let config = JSON.parse(readFileSync(`runners/${file.name}`, 'utf-8'));

        const wsProvider = new WsProvider(config.wsProviderUrl);

        let logger = winston.createLogger({
          transports: [
            new winston.transports.Stream({ stream: this.socket })
          ]
        });

        let runner = new Runner(wsProvider, this.channels, logger);
        this.context[runnerName] = runner;
        this.set(runnerName, runner);
      } catch (error) {
        console.info(`Error ${error.message}. Skipping installing runner '${runnerName}'`);
      }
    }

    this.context['runners'] = this;
  }
}

module.exports = Runners;
