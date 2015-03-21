//=========================================================
// Base class of loaders
//=========================================================

class AbstractLoader {

    load(reader) {
        var cartridge = {}
        this.read(reader, cartridge);
        return cartridge;
    }

}

module.exports = AbstractLoader;
