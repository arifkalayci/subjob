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

const LOG_DIR_NAME = 'logs';

const fs = require('fs');

if (!fs.existsSync(LOG_DIR_NAME)) {
  fs.mkdirSync(LOG_DIR_NAME);
}

function subjobContext(socket) {
  const accounts = new Accounts();
  const accountsVars = accounts.load();

  const plugins = new Plugins();
  const pluginsVars = plugins.load();

  const channels = new Channels();
  const channelsVars = channels.load();

  const runners = new Runners(channels, socket);
  const runnersVars = runners.load();

  return { accounts, ...accountsVars, plugins, ...pluginsVars, channels, ...channelsVars, runners, ...runnersVars };
}

global.jobs = new Jobs();

const server = net.createServer(socket => {
  const repl = Repl.start({
    prompt: '\x1b[36m>> \x1b[0m',
    input: socket,
    output: socket,
    terminal: true,
    preview: false,
    historySize: 1000
  });

  repl.setupHistory(path.join(os.homedir(), HISTORY_FILE_NAME), err => {
    if (err) {
      console.error(err);
    }
  });

  repl.defineCommand('reload', {
    help: 'Reload the context with all accounts, channels, plugins and runners',
    action() {
      this.clearBufferedCommand();
      socket.write(`Reloading context...\n`);
      this.resetContext();
      Object.assign(this.context, subjobContext(socket));
      this.displayPrompt();
    }
  });

  repl.context.listJobs = global.jobs.list.bind(global.jobs, repl.context.console);
  repl.context.removeJob = global.jobs.remove.bind(global.jobs);
  repl.context.clearJobs = global.jobs.clear.bind(global.jobs);

  Object.assign(repl.context, subjobContext(socket));

  socket.on("error", e => {
    console.error(`Socket error: ${e}`);
  });

  repl.on("exit", () => {
    console.log("Client disconnected");
    socket.end();
  });
});

server.on('error', (err) => {
  throw err;
});

server.listen(7953, () => {
  console.log('server bound');
});
