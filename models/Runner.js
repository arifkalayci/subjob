const { ApiPromise } = require('@polkadot/api');

class Runner {
  constructor(provider, channels, logger) {
    this.provider = provider;
    this.channels = channels;
    this.logger = logger;
    this.jobs = [];

    this._api = new ApiPromise({ provider: this.provider });
  }

  api() {
    this.provider.connect();
    return this._api.isReady;
  }

  async runJob(plugin, blockHash, ...args) {
    const job = await plugin.newJob(this, ...args);
    job.run(blockHash).then(ret => { job.returnValue = ret}).catch(err => this.logger.error(err.message));

    return job;
  }
}

module.exports = Runner;
