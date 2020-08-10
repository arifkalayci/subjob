const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

class Job {
  constructor(code, parameters, api, channels, logger, ...args) {
    const funcParams = [...parameters];
    funcParams.unshift('require', 'api', 'channels', 'logger');
    funcParams.push('blockHash');

    args.unshift(require, api, channels, logger);

    this.run = new AsyncFunction(...funcParams, code).bind(this, ...args);
  }
}

module.exports = Job;
