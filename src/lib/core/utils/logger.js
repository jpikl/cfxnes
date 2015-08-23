//=========================================================
// Log levels
//=========================================================

export var LogLevel = {
    OFF: 1,
    ERROR: 2,
    WARN: 3,
    INFO: 4
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

    error(message) {
        if (this.level >= LogLevel.ERROR) {
            if (typeof message === "object" && message.stack && (typeof window === "undefined" || !window || window.chrome)) {
                message = message.stack; // Fix ugly error output in chrome + fix terminal output
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
    }
};

//=========================================================
// Log writer to file
//=========================================================

class FileWriter {

    constructor(path) {
        this.fs = require("fs");
        this.fd = this.fs.openSync(path, "w");
    }

    info(message) {
        this.write(message + "\n");
    }

    warn(message) {
        this.write(message + "\n");
    }

    error(message) {
        this.write(message + "\n");
    }

    write(message) {
        this.fs.writeSync(this.fd, message);
    }

    close() {
        this.fs.close(this.fd);
    }

}

//=========================================================
// Default logger
//=========================================================

export var logger = new Logger;
logger.setLevel(LogLevel.ERROR);
logger.attach(LogWriter.toConsole());
