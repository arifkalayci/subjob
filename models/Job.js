const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

class Job {
  constructor(code, parameters, api, runner, logger, ...args) {
    this.runner = runner;
    this.logger = logger;

    const funcParams = ['require', 'api', 'channels', 'logger', ...parameters, 'blockHash'];
    args.unshift(require, api, runner.channels, logger);
    this._func = new AsyncFunction(...funcParams, code).bind(this, ...args);
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
