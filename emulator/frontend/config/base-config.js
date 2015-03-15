var CoreBaseConfig,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CoreBaseConfig = require("../../core/config/base-config");

function BaseConfig() {
  return BaseConfig.__super__.constructor.apply(this, arguments);
}

extend(BaseConfig, CoreBaseConfig);

BaseConfig.prototype["deviceFactory"] = require("../factories/device-factory");

BaseConfig.prototype["rendererFactory"] = require("../factories/renderer-factory");

BaseConfig.prototype["audioManager"] = require("../managers/audio-manager");

BaseConfig.prototype["cartridgeManager"] = require("../managers/cartridge-manager");

BaseConfig.prototype["executionManager"] = require("../managers/execution-manager");

BaseConfig.prototype["inputManager"] = require("../managers/input-manager");

BaseConfig.prototype["persistenceManager"] = require("../managers/persistence-manager");

BaseConfig.prototype["videoManager"] = require("../managers/video-manager");

BaseConfig.prototype["storage"] = require("../storages/local-storage");

module.exports = BaseConfig;
