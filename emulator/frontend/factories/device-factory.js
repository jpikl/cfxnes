var CoreDeviceFactory,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CoreDeviceFactory = require("../../core/factories/device-factory");

function DeviceFactory(injector) {
  this.injector = injector;
  this.sourceDevices = {
    "keyboard": require("../devices/keyboard"),
    "mouse": require("../devices/mouse")
  };
  this.targetDevices = {
    "joypad": require("../../core/devices/joypad"),
    "zapper": require("../../core/devices/zapper")
  };
  this.targetDevicesAdapters = {
    "joypad": require("../devices/adapters/joypad-adapter"),
    "zapper": require("../devices/adapters/zapper-adapter")
  };
}

extend(DeviceFactory, CoreDeviceFactory);

DeviceFactory.prototype.createSourceDevice = function(id) {
  return this.injector.injectInstance(new this.sourceDevices[id](id));
};

DeviceFactory.prototype.createTargetDevice = function(id) {
  var device;
  device = this.injector.injectInstance(new this.targetDevices[id]);
  return this.injector.injectInstance(new this.targetDevicesAdapters[id](device));
};

module.exports = DeviceFactory;
