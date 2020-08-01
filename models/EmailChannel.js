const nodemailer = require('nodemailer');

class EmailChannel {
  constructor(host, port, user, pass, from, to, subject) {
    this.transport = nodemailer.createTransport({
      host: host,
      port: port,
      auth: {
        user: user,
        pass: pass
      }
    });

    this.from = from;
    this.to = to;
    this.subject = subject;
  }

  send(message) {
    let options = {
      from: this.from,
      to: this.to,
      subject: this.subject,
      text: message
    };

    this.transport.sendMail(options).then(info => { console.log(`Message sent. id: ${info.messageId}`); });
  }
}

module.exports = EmailChannel;
