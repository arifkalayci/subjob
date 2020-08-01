const net = require("net");
const Repl = require("repl");

const Runners = require('./models/Runners');
const Plugins = require('./models/Plugins');
const Channels = require('./models/Channels');

function initContext(repl, socket) {
  const plugins = new Plugins(repl.context);
  plugins.load();

  const channels = new Channels(repl.context);
  channels.load();

  const runners = new Runners(repl.context, channels, socket);
  runners.load();
}

const server = net.createServer(socket => {
  const repl = Repl.start({
    prompt: '\x1b[36m>> \x1b[0m',
    input: socket,
    output: socket,
    terminal: true,
    preview: false
  });

  repl.on('reset', () => initContext(repl));

  initContext(repl, socket);

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
