class Jobs {
  constructor() {
    this._jobs = [];
  }

  add(job) {
    this._jobs.push(job);
  }

  list(cl) {
    cl.table(this._jobs);
  }

  remove(job) {
    job.remove();

    const index = this._jobs.indexOf(job);
    if (index > -1) {
      this._jobs.splice(index, 1);
    }
  }

  clear() {
    this._jobs.forEach(job => {
      job.remove();
    })

    this._jobs = [];
  }
}

module.exports = Jobs;
