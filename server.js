const net = require("net");

const winston = require('winston');

const { LOG_DIR_NAME, ACCOUNTS_DIR_NAME, CHANNELS_DIR_NAME, PLUGINS_DIR_NAME, RUNNERS_DIR_NAME } = require('./constants');
const fs = require('fs');

const SubjobRepl = require('./models/SubjobRepl');

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

const server = net.createServer(socket => {
  new SubjobRepl(socket).start();

  socket.on("error", e => {
    logger.error(`Socket error: ${e}`);
  });
});

server.on('error', (err) => {
  throw err;
});

server.listen(7953, () => {
  logger.info('Server bound');
});
