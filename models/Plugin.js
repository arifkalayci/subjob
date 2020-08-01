const Job = require('./Job');

class Plugin {
  constructor(parameters, code) {
    this.parameters = parameters || [];
    this.code = code;
  }

  newJob(runner, ...args) {
    // if (args.length !== this.parameters.length) {
    //   throw new Error("Wrong number of parameters");
    // }

    return new Job(this.code, this.parameters, runner.api, runner.channels, runner.logger, ...args);
  }
}

module.exports = Plugin;
