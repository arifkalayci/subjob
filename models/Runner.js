const { ApiPromise } = require('@polkadot/api');

const winston = require('winston');

const colors = require('colors');

class Runner {
  constructor(name, provider, channels, stream) {
    this._name = name;
    this.provider = provider;
    this.channels = channels;
    this._stream = stream;
    this.jobs = [];

    this._api = new ApiPromise({ provider: this.provider });
  }

  get name() {
    return this._name;
  }

  api() {
    if (!this.provider.isConnected()) {
      this.provider.connect();
    }

    return this._api.isReady;
  }

  async _onNewHead(blockHash) {
    this.jobs.forEach(async job => {
      if (!job.locked) {
        job.locked = true;

        await job.run(blockHash);

        job.runCount++;
        job.locked = false;
      }
    });
  }

  async _subHeads() {
    const api = await this.api();
    this.unsub = await api.rpc.chain.subscribeFinalizedHeads(header => this._onNewHead(header.hash));
  }

  async runJob(plugin, blockHash, ...args) {
    const logger = winston.createLogger({
      transports: [
        new winston.transports.Stream({
          stream: this._stream,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({level, message, timestamp}) => `${timestamp} [${plugin.name.bold.blue}] ${level}: ${message}`)
          )
        })
      ]
    });

    const job = await plugin.newJob(this, logger, ...args);
    job.run(blockHash);

    return job;
  }

  async addJob(plugin, ...args) {
    const logger = winston.createLogger({
      transports: [
        new winston.transports.File({
          filename: 'logs/run.log' ,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({level, message, timestamp}) => `${timestamp} [${plugin.name}] ${level}: ${message}`)
          )
        })
      ]
    });

    const job = await plugin.newJob(this, logger, ...args);

    job.runCount = 0;
    this.jobs.push(job);

    global.jobs.add(job);

    if (this.jobs.length === 1) {
      this._subHeads();
    }

    return job;
  }

  removeJob(job) {
    const index = this.jobs.indexOf(job);
    if (index > -1) {
      this.jobs.splice(index, 1);
    }

    if (this.jobs.length === 0 && typeof(this.unsub) === 'function') {
      this.unsub();
    }
  }
}

module.exports = Runner;
