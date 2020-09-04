const { readdirSync, readFileSync } = require('fs');
const path = require('path');

const TelegramChannel = require('./TelegramChannel');
const EmailChannel = require('./EmailChannel');
const TwitterChannel = require('./TwitterChannel');

const { CHANNELS_DIR_NAME } = require('../constants');

class Channels extends Map {
  load() {
    this.clear();
    const contextVars = {};
    let channelFiles = readdirSync(CHANNELS_DIR_NAME, { withFileTypes: true }).filter(entry => entry.isFile() && /\.json$/gi.test(entry.name));
    for (let file of channelFiles) {
      let channelName = path.parse(file.name).name;
      try {
        let config = JSON.parse(readFileSync(`${CHANNELS_DIR_NAME}/${file.name}`, 'utf-8'));

        let channel;
        switch (config.type) {
          case 'telegram': {
            channel = new TelegramChannel(config.botId, config.chatId);
            break;
          }
          case 'email': {
            channel = new EmailChannel(config.host, config.port, config.user, config.pass, config.from, config.to, config.subject);
            break;
          }
          case 'twitter': {
            channel = new TwitterChannel(config.consumerKey, config.consumerSecret, config.accessTokenKey, config.accessTokenSecret);
            break;
          }
          default: {
            throw new Error('Unknown channel type');
          }
        }

        this.set(channelName, channel);
        contextVars[channelName] = channel;
      } catch(error) {
        logger.error(`${error.message}. Skipping installing channel '${channelName}'.`);
      }
    }

    return contextVars;
  }

  send(message) {
    for (let channel of this.values()) {
      channel.send(message);
    }
  }
}

module.exports = Channels;
