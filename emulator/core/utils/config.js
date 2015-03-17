//=========================================================
// Dependency injection configuration
//=========================================================

class Config {

    constructor(config) {
        if (config) {
            this.include(config)
        }
    }

    include(config) {
        for (name in config) {
            if (config.hasOwnProperty(name)) {
                this[name] = config[name];
            }
        }
        return this;
    }

    clone() {
        return new Config(this);
    }

    merge(config) {
        return this.clone().include(config);
    }

}

module.exports = Config;
