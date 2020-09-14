const ssh2 = require('ssh2');
const crypto = require('crypto');

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

const config = JSON.parse(fs.readFileSync('config.json'));

const allowedUser = Buffer.from(config.user);
const allowedPassword = Buffer.from(config.password);

const server = new ssh2.Server({
  hostKeys: [fs.readFileSync('host.key')]
});

server.on('connection', (client, info) => {
  client.on('authentication', (ctx) => {
    const user = Buffer.from(ctx.username);
    if (user.length !== allowedUser.length || !crypto.timingSafeEqual(user, allowedUser)) {
      return ctx.reject();
    }

    switch (ctx.method) {
      case 'password':
        const password = Buffer.from(ctx.password);
        if (password.length !== allowedPassword.length || !crypto.timingSafeEqual(password, allowedPassword)) {
          return ctx.reject();
        }
        break;
      default:
        return ctx.reject();
    }

    ctx.accept();
  });

  client.once('ready', () => {
    client.on('session', (accept, reject) => {
      const session = accept();

      session.once('pty', (accept, reject, info) => {
        accept();
      });

      session.once('shell', (accept, reject) => {
        const stream = accept();
        new SubjobRepl(stream).start();
      });
    });
  });
});

server.listen(7953, '0.0.0.0', () => {
  console.log(`Listening on port ${server.address().port}`);
});
