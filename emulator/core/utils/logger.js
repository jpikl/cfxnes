function Logger(id1) {
  this.id = id1;
}

Logger.loggers = [];

Logger.get = function(id) {
  var base;
  if (id == null) {
    id = "default";
  }
  return (base = this.loggers)[id] != null ? base[id] : base[id] = new Logger(id);
};

Logger.console = function() {
  return console;
};

Logger.file = function(fileName) {
  return new FileWriter(fileName);
};

Logger.prototype.attach = function(writer) {
  if (this.writers == null) {
    this.writers = [];
  }
  this.writers.push(writer);
  return this;
};

Logger.prototype.detach = function(writer) {
  var index;
  if (this.writers) {
    index = this.writers.indexOf(writer);
    if (index >= 0) {
      return this.writers.splice(index, 1);
    }
  }
};

Logger.prototype.close = function() {
  var i, len, ref, writer;
  if (this.writers) {
    ref = this.writers;
    for (i = 0, len = ref.length; i < len; i++) {
      writer = ref[i];
      if (typeof writer.close === "function") {
        writer.close();
      }
    }
    this.writers = null;
  }
  Logger.loggers[this.id] = void 0;
  return void 0;
};

Logger.prototype.info = function(message) {
  var i, len, ref, writer;
  if (this.writers) {
    ref = this.writers;
    for (i = 0, len = ref.length; i < len; i++) {
      writer = ref[i];
      writer.info(message);
    }
  }
  return void 0;
};

Logger.prototype.warn = function(message) {
  var i, len, ref, writer;
  if (this.writers) {
    ref = this.writers;
    for (i = 0, len = ref.length; i < len; i++) {
      writer = ref[i];
      writer.warn(message);
    }
  }
  return void 0;
};

Logger.prototype.error = function(message) {
  var i, len, ref, writer;
  if (this.writers) {
    if (typeof message === "object" && message.stack && ((typeof window === "undefined" || window === null) || window.chrome)) {
      message = message.stack;
    }
    ref = this.writers;
    for (i = 0, len = ref.length; i < len; i++) {
      writer = ref[i];
      writer.error(message);
    }
  }
  return void 0;
};

function FileWriter(fileName) {}

FileWriter.prototype.info = function(message) {
  return this.write(message + "\n");
};

FileWriter.prototype.warn = function(message) {
  return this.write(message + "\n");
};

FileWriter.prototype.error = function(message) {
  return this.write(message + "\n");
};

FileWriter.prototype.write = function(message) {
  return this.fs.writeSync(this.fd, message);
};

FileWriter.prototype.close = function() {
  return this.fs.close(this.fd);
};

module.exports = Logger;
