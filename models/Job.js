const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

const moment = require('moment');

class Job {
  constructor(plugin, api, runner, logger, ...args) {
    this.plugin = plugin;
    this.runner = runner;
    this.logger = logger;
    this.args = [...args];
    this.addedAt = moment();

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

  toHuman() {
    return {
      pluginName: this.plugin.name,
      runnerName: this.runner.name,
      arguments: this.args,
      addedAt: this.addedAt.format('D/M/Y HH:MM:SS')
    }
  }
}

module.exports = Job;
