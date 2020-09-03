const Job = require('./Job');

class Plugin {
  constructor(name, parameters, code) {
    this._name = name;
    this.parameters = parameters || [];
    this.code = code;
  }

  async newJob(runner, logger, ...args) {
    // if (args.length !== this.parameters.length) {
    //   throw new Error("Wrong number of parameters");
    // }

    const api = await runner.api();
    return new Job(this, api, runner, logger, ...args);
  }

  get name() {
    return this._name;
  }
}

module.exports = Plugin;
