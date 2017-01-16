/**
 * @constructor
 */
var JSZip = function() {};

/**
 * @param {Uint8Array} data
 * @return {!IThenable<JSZip>}
 */
JSZip.loadAsync = function(data) {};

/**
 * @param {string|RegExp} name
 * @return {Array<!ZipObject>}
 */
JSZip.prototype.file = function(name) {};

/**
 * @constructor
 */
var ZipObject = function() {};

/**
 * @param {string} type
 */
ZipObject.prototype.async = function(type) {};
