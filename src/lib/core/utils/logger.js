var loggers = {};

//=========================================================
// Logger object
//=========================================================

export class Logger {

    constructor(id) {
        this.id = id;
        this.writers = null;
    }

    attach(writer) {
        if (!this.writers) {
            this.writers = [];
        }
        this.writers.push(writer);
    }

    detach(writer) {
        if (this.writers) {
            var index = this.writers.indexOf(writer);
            if (index >= 0) {
                this.writers.splice(index, 1);
            }
        }
    }

    close() {
        if (this.writers) {
            for (var writer of this.writers) {
                if (typeof writer.close === "function") {
                    writer.close();
                }
            }
            this.writers = null;
        }
        loggers[this.id] = undefined;
    }

    info(message) {
        if (this.writers) {
            for (var writer of this.writers) {
                writer.info(message);
            }
        }
    }

    warn(message) {
        if (this.writers) {
            for (var writer of this.writers) {
                writer.warn(message);
            }
        }
    }

    error(message) {
        if (this.writers) {
            if (typeof message === "object" && message.stack && (typeof window === "undefined" || !window || window.chrome)) {
                message = message.stack; // Fix ugly error output in chrome + fix terminal output
            }
            for (var writer of this.writers) {
                writer.error(message);
            }
        }
    }

    //=========================================================
    // Factory methods
    //=========================================================

    static get(id = "default") {
        if (!loggers[id]) {
            loggers[id] = new Logger(id);
        }
        return loggers[id];
    }

    static console() {
        return console;
    }

    static file(filename) {
        return new FileWriter(filename);
    }

}

//=========================================================
// Default logger
//=========================================================

export var logger = Logger.get();

//=========================================================
// File log writer
//=========================================================

class FileWriter {

    constructor(filename) {
        this.fs = require("fs");
        this.fd = this.fs.openSync(filename, "w");
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
