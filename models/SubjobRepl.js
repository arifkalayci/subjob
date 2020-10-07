const Repl = require("repl");
const colors = require('colors');
const path = require('path');
const os = require('os');

const Jobs = require('./Jobs');

const Runners = require('./Runners');
const Plugins = require('./Plugins');
const Channels = require('./Channels');
const Accounts = require('./Accounts');

const HISTORY_FILE_NAME = '.subjob_history';

class SubjobRepl {
  constructor(inputStream, outputStream) {
    this._inputStream = inputStream;
    this._outputStream = outputStream;
    global.jobs = global.jobs || new Jobs();
  }

  subjobContext(repl) {
    const accounts = new Accounts();
    const accountsVars = accounts.load();

    const plugins = new Plugins();
    const pluginsVars = plugins.load();

    const channels = new Channels();
    const channelsVars = channels.load();

    const runners = new Runners(channels, this._outputStream);
    const runnersVars = runners.load();

    return {
      listJobs: global.jobs.list.bind(global.jobs, this._repl.context.console),
      removeJob: global.jobs.remove.bind(global.jobs),
      clearJobs: global.jobs.clear.bind(global.jobs),
      accounts,
      ...accountsVars,
      plugins,
      ...pluginsVars,
      channels,
      ...channelsVars,
      runners,
      ...runnersVars
    };
  }

  start() {
    this._repl = Repl.start({
      prompt: '>> '.brightBlue,
      input: this._inputStream,
      output: this._outputStream,
      terminal: true,
      preview: false,
      historySize: 1000,
      breakEvalOnSigint: true
    });

    this._repl.setupHistory(path.join(os.homedir(), HISTORY_FILE_NAME), err => {
      if (err) {
        logger.error(err);
      }
    });

    Object.assign(this._repl.context, this.subjobContext());

    this._repl.defineCommand('reload', {
      help: 'Reload the context with all accounts, channels, plugins and runners',
      action() {
        this._repl.clearBufferedCommand();
        this._outputStream.write(`Reloading context...\n`);

        this._repl.resetContext();
        Object.assign(this._repl.context, this.subjobContext());

        this._repl.displayPrompt();
      }
    });

    this._repl.on("exit", () => {
      logger.info("Client disconnected");
      this._outputStream.end();
    });
  }
}

module.exports = SubjobRepl;
