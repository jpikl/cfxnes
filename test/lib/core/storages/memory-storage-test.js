//=============================================================================
// Memory storage test
//=============================================================================

import chai              from "chai"
import { MemoryStorage } from "../../../../src/lib/core/storages/memory-storage"

var expect = chai.expect;

describe("MemoryStorage", () => {

    var storage;

    beforeEach(() => {
        storage = new MemoryStorage;
    });

    it("should return null for nonexistent keys", () => {
        expect(storage.readString("key")).to.be.null;
        expect(storage.readData("key")).to.be.null;
        expect(storage.readObject("key")).to.be.null;
    });

    it("should read/write strings", () => {
        storage.writeString("key", "value");
        expect(storage.readString("key")).to.equal("value");
    });

    it("should read/write data", () => {
        var data = new Uint8Array(1024);
        for (var i = 0; i < data.length; i++) {
            data[i] = i % 256;
        }
        storage.writeData("key", data);
        expect(storage.readData("key")).to.deep.equal(data);
    });

    it("should read/write objects", () => {
        var object = {
            number: 1,
            string: "value",
            object: {
                number: 1,
                string: "value"
            }
        };
        storage.writeObject("key", object);
        expect(storage.readObject("key")).to.deep.equal(object);
    });

    it("should handle different keys", () => {
        storage.writeString("a", "A");
        storage.writeString("b", "B");
        expect(storage.readString("a")).to.equal("A");
        expect(storage.readString("b")).to.equal("B");
    });

});
