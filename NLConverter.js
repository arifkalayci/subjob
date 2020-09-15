const Transform = require('stream').Transform;

const CR = Buffer.from('\r');

class NLConverter extends Transform {
  _transform(chunk, enc, cb) {
    let i = 0;
    let last = 0;
    while ((i = chunk.indexOf(10, i)) !== -1) {
      if (i === 0) {
        this.push(CR);
      } else if (chunk[i - 1] !== 13) {
        this.push(chunk.slice(last, i));
        this.push(CR);
        last = i;
      }
      ++i;
    }
    if (last === 0)
      this.push(chunk);
    else
      this.push(chunk.slice(last));
    cb();
  }
}

module.exports = NLConverter;
