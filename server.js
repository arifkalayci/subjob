const net = require("net");
const Repl = require("repl");

const Jobs = require('./models/Jobs');
const Runners = require('./models/Runners');
const Plugins = require('./models/Plugins');
const Channels = require('./models/Channels');
const Accounts = require('./models/Accounts');

const path = require('path');
const os = require('os');
const HISTORY_FILE_NAME = '.subjob_history';

const { LOG_DIR_NAME, ACCOUNTS_DIR_NAME, CHANNELS_DIR_NAME, PLUGINS_DIR_NAME, RUNNERS_DIR_NAME } = require('./constants');

const fs = require('fs');

const winston = require('winston');

const colors = require('colors');

[LOG_DIR_NAME, ACCOUNTS_DIR_NAME, CHANNELS_DIR_NAME, PLUGINS_DIR_NAME, RUNNERS_DIR_NAME].forEach(dirName => {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
  }
})

global.logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({level, message, timestamp}) => `${timestamp} ${level.toUpperCase()}: ${message}`)
      )
    })
  ]
});

global.jobs = new Jobs();

const server = net.createServer(socket => {
  const repl = Repl.start({
    prompt: '>> '.brightBlue,
    input: socket,
    output: socket,
    terminal: true,
    preview: false,
    historySize: 1000
  });

  repl.setupHistory(path.join(os.homedir(), HISTORY_FILE_NAME), err => {
    if (err) {
      logger.error(err);
    }
  });

  function subjobContext() {
    const accounts = new Accounts();
    const accountsVars = accounts.load();

    const plugins = new Plugins();
    const pluginsVars = plugins.load();

    const channels = new Channels();
    const channelsVars = channels.load();

    const runners = new Runners(channels, socket);
    const runnersVars = runners.load();

    return {
      listJobs: global.jobs.list.bind(global.jobs, repl.context.console),
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

  repl.defineCommand('reload', {
    help: 'Reload the context with all accounts, channels, plugins and runners',
    action() {
      this.clearBufferedCommand();
      socket.write(`Reloading context...\n`);

      this.resetContext();
      Object.assign(this.context, subjobContext());

      this.displayPrompt();
    }
  });

  Object.assign(repl.context, subjobContext());

  socket.on("error", e => {
    logger.error(`Socket error: ${e}`);
  });

  repl.on("exit", () => {
    logger.info("Client disconnected");
    socket.end();
  });
});

server.on('error', (err) => {
  throw err;
});

server.listen(7953, () => {
  logger.info('Server bound');
});
