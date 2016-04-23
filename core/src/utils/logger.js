import {formatError} from './format';

//=========================================================
// Log levels
//=========================================================

export var LogLevel = {
  OFF: 1,
  ERROR: 2,
  WARN: 3,
  INFO: 4,
  ALL: 4,
};

//=========================================================
// Logger
//=========================================================

export class Logger {

  constructor(level) {
    this.level = level || LogLevel.OFF;
    this.writers = [];
  }

  attach(writer) {
    if (this.writers.indexOf(writer) < 0) {
      this.writers.push(writer);
    }
  }

  detach(writer) {
    var index = this.writers.indexOf(writer);
    if (index >= 0) {
      this.writers.splice(index, 1);
    }
  }

  close() {
    for (var writer of this.writers) {
      if (writer.close) {
        writer.close();
      }
    }
    this.writers = [];
  }

  setLevel(level) {
    this.level = level;
  }

  info(message) {
    if (this.level >= LogLevel.INFO) {
      for (var writer of this.writers) {
        writer.info(message);
      }
    }
  }

  warn(message) {
    if (this.level >= LogLevel.WARN) {
      for (var writer of this.writers) {
        writer.warn(message);
      }
    }
  }

  error(message, error) {
    if (this.level >= LogLevel.ERROR) {
      if (message && error && typeof error === 'object') {
        message = message + '\n\n' + formatError(error);
      } else if (message && typeof message === 'object') {
        message = formatError(message);
      } else {
        message = message || 'Unknown error';
      }
      for (var writer of this.writers) {
        writer.error(message);
      }
    }
  }

}

//=========================================================
// Log writers
//=========================================================

export var LogWriter = {
  toConsole() {
    return console;
  },
  toFile(path) {
    return new FileWriter(path);
  },
  toBuffer() {
    return new BufferWriter;
  },
};

//=========================================================
// Log writer to file
//=========================================================

class FileWriter {

  constructor(path) {
    this.fs = require('fs');
    this.fd = this.fs.openSync(path, 'w');
  }

  info(message) {
    this.write(message);
  }

  warn(message) {
    this.write(message);
  }

  error(message) {
    this.write(message);
  }

  write(message) {
    this.fs.writeSync(this.fd, message + '\n');
  }

  close() {
    this.fs.close(this.fd);
  }

}

//=========================================================
// Log writer to buffer
//=========================================================

class BufferWriter {

  constructor() {
    this.buffer = [];
  }

  info(message) {
    this.buffer.push(message);
  }

  warn(message) {
    this.buffer.push(message);
  }

  error(message) {
    this.buffer.push(message);
  }

  write(message) {
    this.buffer.push(message);
  }

  close() {
  }

}

//=========================================================
// Default logger
//=========================================================

var logger = new Logger;
logger.setLevel(LogLevel.WARN);
logger.attach(LogWriter.toConsole());
export default logger;
