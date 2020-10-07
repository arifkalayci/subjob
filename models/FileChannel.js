const { appendFile } = require('fs');

class FileChannel {
  constructor(path) {
    this.path = path;
  }

  send(message) {
    appendFile(this.path, message, err => {
      if (err) throw err;
    });
  }
}

module.exports = FileChannel;
