//=========================================================
// Base class of loaders
//=========================================================

export class AbstractLoader {

    constructor(name) {
        this.name = name;
    }

    load(reader) {
        var cartridge = {}
        this.read(reader, cartridge);
        return cartridge;
    }

}
