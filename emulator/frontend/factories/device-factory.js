import { DeviceFactory as CoreDeviceFactory } from "../../core/factories/device-factory";
import { Keyboard } from "../devices/keyboard";
import { Mouse } from "../devices/mouse";
import { Joypad } from "../../core/devices/joypad";
import { Zapper } from "../../core/devices/zapper";
import { JoypadAdapter } from "../devices/adapters/joypad-adapter";
import { ZapperAdapter } from "../devices/adapters/zapper-adapter";


var
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;


export function DeviceFactory(injector) {
  this.injector = injector;
  this.sourceDevices = {
    "keyboard": Keyboard,
    "mouse": Mouse
  };
  this.targetDevices = {
    "joypad": Joypad,
    "zapper": Zapper
  };
  this.targetDevicesAdapters = {
    "joypad": JoypadAdapter,
    "zapper": ZapperAdapter
  };
}

extend(DeviceFactory, CoreDeviceFactory);

DeviceFactory.prototype.createSourceDevice = function(id) {
  return this.injector.inject(new this.sourceDevices[id](id));
};

DeviceFactory.prototype.createTargetDevice = function(id) {
  var device;
  device = this.injector.inject(new this.targetDevices[id]);
  return this.injector.inject(new this.targetDevicesAdapters[id](device));
};
