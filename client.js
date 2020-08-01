const net = require("net");

const socket = net.connect(7953, 'localhost');

process.stdin.pipe(socket);
socket.pipe(process.stdout);

socket.on("connect", () => {
  process.stdin.setRawMode(true);
});

socket.on("close", () => {
  console.log('Disconnected');
  process.exit(0);
});

process.on("exit", () => {
  socket.end();
});
