const Twitter = require('twitter-lite');

class TwitterChannel {
  constructor(consumerKey, consumerSecret, accessTokenKey, accessTokenSecret) {
    this.client = new Twitter({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      access_token_key: accessTokenKey,
      access_token_secret: accessTokenSecret
    });
  }

  send(message) {
    this.client.post("statuses/update", { status: message });
  }
}

module.exports = TwitterChannel;
