const { readdirSync, readFileSync } = require('fs');
const path = require('path');

const TelegramChannel = require('./TelegramChannel');
const EmailChannel = require('./EmailChannel');

class Channels extends Map {
  constructor(context) {
    super();
    this.context = context;
  }

  load() {
    this.clear();

    let channelFiles = readdirSync('channels', { withFileTypes: true }).filter(entry => entry.isFile() && /\.json$/gi.test(entry.name));
    for (let file of channelFiles) {
      let channelName = path.parse(file.name).name;
      try {
        let config = JSON.parse(readFileSync(`channels/${file.name}`, 'utf-8'));

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
          default: {
            throw new Error('Unknown channel type');
          }
        }

        this.context[channelName] = channel;
        this.set(channelName, channel);
      } catch(error) {
        console.info(`Error: ${error.message}. Skipping installing channel '${channelName}'.`);
      }
    }

    this.context['channels'] = this;
  }

  send(message) {
    for (let channel of this.values()) {
      channel.send(message);
    }
  }
}

module.exports = Channels;
