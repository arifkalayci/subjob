const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

class Job {
  constructor(code, parameters, api, channels, logger, ...args) {
    this.logger = logger;

    const funcParams = [...parameters];
    funcParams.unshift('require', 'api', 'channels', 'logger');
    funcParams.push('blockHash');

    args.unshift(require, api, channels, logger);

    this._func = new AsyncFunction(...funcParams, code).bind(this, ...args);
  }

  async run(blockHash) {
    try {
      this.returnValue = await this._func(blockHash);
    } catch (err) {
      this.logger.error(err.message)
    }
  }
}

module.exports = Job;
