import { TVSystem } from "../../core/common/types";
import { logger }   from "../../core/utils/logger";

var
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };


var tvSystemAliases = {
  "ntsc": TVSystem.NTSC,
  "pal": TVSystem.PAL
};

const DEFAULT_TV_SYSTEM = null;
const DFEFAULT_SPEED = 1;

export function ExecutionManager() {
  this.onVisibilityChange = bind(this.onVisibilityChange, this);
  this.draw = bind(this.draw, this);
  this.step = bind(this.step, this);
}

ExecutionManager["dependencies"] = [ "nes", "videoManager", "audioManager", "inputManager" ];

ExecutionManager.prototype.init = function(nes, videoManager, audioManager, inputManager) {
  this.nes = nes;
  this.videoManager = videoManager;
  this.audioManager = audioManager;
  this.inputManager = inputManager;
  this.initFPS();
  this.initListeners();
  return this.setDefaults();
};

ExecutionManager.prototype.initListeners = function() {
  return document.addEventListener("visibilitychange", this.onVisibilityChange);
};

ExecutionManager.prototype.setDefaults = function() {
  logger.info("Using default execution configuration");
  this.setTVSystem(DEFAULT_TV_SYSTEM);
  return this.setSpeed(DFEFAULT_SPEED);
};

ExecutionManager.prototype.start = function() {
  var period;
  if (!this.isRunning()) {
    logger.info("Starting execution");
    period = 1000 / (this.speed * this.getTargetFPS());
    this.executionId = setInterval(this.step, period);
    return this.audioManager.setPlaying(true);
  }
};

ExecutionManager.prototype.stop = function() {
  if (this.isRunning()) {
    logger.info("Stopping execution");
    clearInterval(this.executionId);
    this.executionId = null;
    return this.audioManager.setPlaying(false);
  }
};

ExecutionManager.prototype.restart = function() {
  this.stop();
  return this.start();
};

ExecutionManager.prototype.isRunning = function() {
  return this.executionId != null;
};

ExecutionManager.prototype.step = function() {
  this.inputManager.processSources();
  this.videoManager.renderFrame();
  this.updateFPS();
  cancelAnimationFrame(this.drawId);
  return this.drawId = requestAnimationFrame(this.draw);
};

ExecutionManager.prototype.draw = function() {
  return this.videoManager.drawFrame();
};

ExecutionManager.prototype.onVisibilityChange = function() {
  if (document.hidden) {
    logger.info("Lost visibility");
    this.autoPaused = this.isRunning();
    return this.stop();
  } else {
    logger.info("Gained visibility");
    if (this.autoPaused) {
      return this.start();
    }
  }
};

ExecutionManager.prototype.hardReset = function() {
  logger.info("Hard reset");
  return this.nes.pressPower();
};

ExecutionManager.prototype.softReset = function() {
  logger.info("Soft reset");
  return this.nes.pressReset();
};

ExecutionManager.prototype.setTVSystem = function(tvSystem) {
  if (tvSystem == null) {
    tvSystem = DEFAULT_TV_SYSTEM;
  }
  logger.info("Setting TV system to '" + (tvSystem || 'autodetection mode') + "'");
  this.tvSystem = tvSystem;
  this.nes.setTVSystem(tvSystemAliases[tvSystem]);
  if (this.isRunning()) {
    return this.restart();
  }
};

ExecutionManager.prototype.getTVSystem = function() {
  return this.tvSystem;
};

ExecutionManager.prototype.setSpeed = function(speed) {
  if (speed == null) {
    speed = DFEFAULT_SPEED;
  }
  logger.info("Setting emulation speed to " + speed + "x");
  this.speed = speed;
  if (this.isRunning()) {
    this.restart();
  }
  return this.audioManager.setSpeed(speed);
};

ExecutionManager.prototype.getSpeed = function() {
  return this.speed;
};

ExecutionManager.prototype.initFPS = function() {
  this.fpsBuffer = (function() {
    var i, results;
    results = [];
    for (i = 1; i <= 10; i++) {
      results.push(0);
    }
    return results;
  })();
  this.fpsIndex = 0;
  return this.fpsTime = 0;
};

ExecutionManager.prototype.updateFPS = function() {
  var timeNow;
  timeNow = Date.now();
  this.fpsBuffer[this.fpsIndex] = 1000 / (timeNow - this.fpsTime);
  this.fpsIndex = (this.fpsIndex + 1) % this.fpsBuffer.length;
  return this.fpsTime = timeNow;
};

ExecutionManager.prototype.getFPS = function() {
  return (this.fpsBuffer.reduce(function(a, b) {
    return a + b;
  })) / this.fpsBuffer.length;
};

ExecutionManager.prototype.getTargetFPS = function() {
  var tvSystem;
  tvSystem = this.nes.getTVSystem();
  switch (tvSystem) {
    case TVSystem.NTSC:
      return 60;
    case TVSystem.PAL:
      return 50;
    default:
      throw new Error("Unknown TV system " + tvSystem);
  }
};

ExecutionManager.prototype.readConfiguration = function(config) {
  logger.info("Reading execution manager configuration");
  if (config["execution"]) {
    this.setTVSystem(config["execution"]["tvSystem"]);
    return this.setSpeed(config["execution"]["speed"]);
  }
};

ExecutionManager.prototype.writeConfiguration = function(config) {
  logger.info("Writing execution manager configuration");
  return config["execution"] = {
    "tvSystem": this.getTVSystem(),
    "speed": this.getSpeed()
  };
};
