const net = require("net");
const Repl = require("repl");

const Runners = require('./models/Runners');
const Plugins = require('./models/Plugins');
const Channels = require('./models/Channels');
const Accounts = require('./models/Accounts');

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

const server = net.createServer(socket => {
  const repl = Repl.start({
    prompt: '\x1b[36m>> \x1b[0m',
    input: socket,
    output: socket,
    terminal: true,
    preview: false
  });

  repl.on('reset', () => Object.assign(repl.context, subjobContext(socket)));

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
