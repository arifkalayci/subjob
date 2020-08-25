const Job = require('./Job');

class Plugin {
  constructor(parameters, code) {
    this.parameters = parameters || [];
    this.code = code;
  }

  async newJob(runner, logger, ...args) {
    // if (args.length !== this.parameters.length) {
    //   throw new Error("Wrong number of parameters");
    // }

    const api = await runner.api();
    return new Job(this.code, this.parameters, api, runner.channels, logger, ...args);
  }
}

module.exports = Plugin;
