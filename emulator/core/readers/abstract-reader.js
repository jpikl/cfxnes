//=========================================================
// Base class of readers
//=========================================================

class AbstractReader {

    constructor() {
        this.reset();
    }

    reset () {
        this.position = 0;
    }

    read(size = this.getLength()) {
        var start = this.position;
        var end = Math.min(start + size, this.getLength())
        this.position = end;
        return this.getData(start, end);
    }

}

module.exports = AbstractReader;
