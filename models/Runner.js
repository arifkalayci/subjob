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
    const job = await plugin.newJob(this, ...args);
    job.run(blockHash);

    return job;
  }

  async addJob(plugin, ...args) {
    const job = await plugin.newJob(this, ...args);

    job.runCount = 0;
    this.jobs.push(job);

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
