const { ApiPromise } = require('@polkadot/api');

class Runner {
  constructor(provider, channels, logger) {
    this.provider = provider;
    this.channels = channels;
    this.logger = logger;
    this.jobs = [];
  }

  async init() {
    this._api = await ApiPromise.create({ provider: this.provider });
    return this._api;
  }

  subHeads() {
    return this.api.rpc.chain.subscribeFinalizedHeads(header => { this.onNewHead(header.hash) });
  }

  get api() {
    return this._api;
  }

  runJob(plugin, blockHash, ...args) {
    const job = plugin.newJob(this, ...args);
    job.run(blockHash).then(ret => { job.returnValue = ret}).catch(err => this.logger.error(err.message));

    return job;
  }
}

module.exports = Runner;
