angular.module("cfxnes").factory("emulator", () => {
    var emulator = new CFxNES;
    emulator.putDependency("md5", md5);
    emulator.putDependency("JSZip", JSZip);
    emulator.putDependency("screenfull", screenfull);
    return emulator;
});
