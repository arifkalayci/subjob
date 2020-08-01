const https = require('https');

class TelegramChannel {
  constructor(botId, chatId) {
    this.botId = botId;
    this.chatId = chatId;
  }

  send(message) {
    https.get(`https://api.telegram.org/bot${this.botId}/sendMessage?chat_id=${this.chatId}&text=${message}`);
  }
}

module.exports = TelegramChannel;
