const ssh2 = require('ssh2');
const crypto = require('crypto');

const winston = require('winston');

const { LOG_DIR_NAME, ACCOUNTS_DIR_NAME, CHANNELS_DIR_NAME, PLUGINS_DIR_NAME, RUNNERS_DIR_NAME } = require('./constants');
const fs = require('fs');

const SubjobRepl = require('./models/SubjobRepl');

const NLConverter = require('./NLConverter');

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
const allowedPublicKey = ssh2.utils.parseKey(fs.readFileSync(config.publicKeyFile));
const allowedPublicSSHKey = allowedPublicKey.getPublicSSH();

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
      case 'publickey':
        if (ctx.key.algo !== allowedPublicKey.type
              || ctx.key.data.length !== allowedPublicSSHKey.length
              || !crypto.timingSafeEqual(ctx.key.data, allowedPublicSSHKey)
              || (ctx.signature && allowedPublicKey.verify(ctx.blob, ctx.signature) !== true)) {
          return ctx.reject();
        }

        break;
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

      let cols = 0;

      session.once('pty', (accept, reject, info) => {
        cols = info.cols;
        accept();
      });

      const convertStream = new NLConverter();

      session.once('shell', (accept, reject) => {
        const stream = accept();

        convertStream.pipe(stream);
        if (cols > 0) {
          convertStream.columns = cols;
        }

        new SubjobRepl(stream, convertStream).start();
      });

      session.on('window-change', (accept, reject, { rows, cols, height, width }) => {
        convertStream.columns = cols;

        // Not sure if this is required
        if (typeof(accept) === 'function)') {
          accept();
        }
      });
    });
  });
});

server.listen(7953, '0.0.0.0', () => {
  logger.info(`Listening on port ${server.address().port}`);
});
