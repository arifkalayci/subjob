const Job = require('./Job');

class Plugin {
  constructor(name, parameters, code) {
    this.name = name;
    this.parameters = parameters || [];
    this.code = code;
  }

  async newJob(runner, logger, ...args) {
    // if (args.length !== this.parameters.length) {
    //   throw new Error("Wrong number of parameters");
    // }

    const api = await runner.api();
    return new Job(this.code, this.parameters, api, runner, logger, ...args);
  }

  get name() {
    return this.name;
  }
}

module.exports = Plugin;
