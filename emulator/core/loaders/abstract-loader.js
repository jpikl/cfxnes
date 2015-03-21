//=========================================================
// Base class of loaders
//=========================================================

class AbstractLoader {

    constructor(name) {
        this.name = name;
    }

    load(reader) {
        var cartridge = {}
        this.read(reader, cartridge);
        return cartridge;
    }

}

module.exports = AbstractLoader;
