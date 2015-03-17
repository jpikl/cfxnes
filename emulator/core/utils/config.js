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
    }

    merge(config) {
        var result = new Config(this);
        result.include(config);
        return result;
    }

}

module.exports = Config;
