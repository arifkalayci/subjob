const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

class Job {
  constructor(plugin, api, runner, logger, ...args) {
    this.plugin = plugin;
    this.runner = runner;
    this.logger = logger;

    const funcParams = ['require', 'api', 'channels', 'logger', ...this.plugin.parameters, 'blockHash'];
    args.unshift(require, api, runner.channels, logger);
    this._func = new AsyncFunction(...funcParams, this.plugin.code).bind(this, ...args);
  }

  async run(blockHash) {
    try {
      this.returnValue = await this._func(blockHash);
    } catch (err) {
      this.logger.error(err.message)
    }
  }

  remove() {
    this.runner.removeJob(this);
  }
}

module.exports = Job;
