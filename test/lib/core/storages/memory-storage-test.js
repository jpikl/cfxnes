//=============================================================================
// Memory storage test
//=============================================================================

import chai              from "chai"
import chaiAsPromised    from "chai-as-promised";
import { MemoryStorage } from "../../../../src/lib/core/storages/memory-storage"

chai.use(chaiAsPromised);
var expect = chai.expect;

describe("MemoryStorage", () => {

    var storage;

    beforeEach(() => {
        storage = new MemoryStorage;
    });

    it("should return null for nonexistent keys", () => {
        return Promise.all([
            expect(storage.readString("key")).to.eventually.be.null,
            expect(storage.readData("key")).to.eventually.be.null,
            expect(storage.readObject("key")).to.eventually.be.null,
        ]);
    });

    it("should read/write strings", () => {
        return storage.writeString("key", "value").then(() => {
            return expect(storage.readString("key")).to.eventually.equal("value");
        });
    });

    it("should read/write data", () => {
        var data = new Uint8Array(1024);
        for (var i = 0; i < data.length; i++) {
            data[i] = i % 256;
        }
        return storage.writeData("key", data).then(() => {
            return expect(storage.readData("key")).to.eventually.deep.equal(data);
        });
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
        return storage.writeObject("key", object).then(() => {
            return expect(storage.readObject("key")).to.eventually.deep.equal(object);
        });
    });

    it("should handle different keys", () => {
        return Promise.all([
            storage.writeString("a", "A"),
            storage.writeString("b", "B")
        ]).then(() => {
            return Promise.all([
                expect(storage.readString("a")).to.eventually.equal("A"),
                expect(storage.readString("b")).to.eventually.equal("B")
            ]);
        });
    });

});
