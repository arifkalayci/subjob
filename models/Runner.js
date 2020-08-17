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
    if (!this.provider.isConnected()) {
      this.provider.connect();
    }

    return this._api.isReady;
  }

  async runJob(plugin, blockHash, ...args) {
    const job = await plugin.newJob(this, ...args);
    job.run(blockHash);

    return job;
  }
}

module.exports = Runner;
