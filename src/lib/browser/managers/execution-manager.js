import { TVSystem }   from "../../core/common/types";
import { clearArray } from "../../core/utils/arrays";
import { logger }     from "../../core/utils/logger";

const tvSystemAliases = {
    "ntsc": TVSystem.NTSC,
    "pal":  TVSystem.PAL
};

//=========================================================
// Execution manager
//=========================================================

export class ExecutionManager {

    constructor() {
        this.dependencies = ["nes", "videoManager", "audioManager", "inputManager"];
    }

    inject(nes, videoManager, audioManager, inputManager) {
        this.nes = nes;
        this.videoManager = videoManager;
        this.audioManager = audioManager;
        this.inputManager = inputManager;
        this.initFPS();
        this.initCallbacks();
        this.initListeners();
        this.setDefaults();
    }

    initCallbacks() {
        this.stepCallback = () => this.step();
        this.drawCallback = () => this.videoManager.drawFrame();
    }

    initListeners() {
        document.addEventListener("visibilitychange", () => this.onVisibilityChange());
    }

    setDefaults() {
        logger.info("Using default execution configuration");
        this.setTVSystem();
        this.setSpeed();
    }

    //=========================================================
    // Execution
    //=========================================================

    start() {
        if (!this.isRunning()) {
            logger.info("Starting execution");
            var period = 1000 / (this.speed * this.getTargetFPS());
            this.executionId = setInterval(this.stepCallback, period);
            this.audioManager.setPlaying(true);
        }
    }

    stop() {
        if (this.isRunning()) {
            logger.info("Stopping execution");
            clearInterval(this.executionId);
            this.executionId = null;
            this.audioManager.setPlaying(false);
        }
    }

    restart() {
        this.stop();
        this.start();
    }

    isRunning() {
        return this.executionId != null;
    }

    step() {
        this.inputManager.updateState();
        this.videoManager.renderFrame();
        this.updateFPS();
        cancelAnimationFrame(this.drawId); // In case we are running faster then browser refresh rate
        this.drawId = requestAnimationFrame(this.drawCallback);
    }

    //=========================================================
    // Visibility change
    //=========================================================

    onVisibilityChange() {
        if (document.hidden) {
            logger.info("Lost visibility");
            this.autoPaused = this.isRunning();
            this.stop();
        } else {
            logger.info("Gained visibility");
            if (this.autoPaused) {
                this.start();
            }
        }
    }

    //=========================================================
    // Inputs
    //=========================================================

    hardReset() {
        logger.info("Hard reset");
        this.nes.pressPower();
    }

    softReset() {
        logger.info("Soft reset");
        this.nes.pressReset();
    }

    //=========================================================
    // TV system
    //=========================================================

    setTVSystem(tvSystem = null) {
        if (this.tvSystem !== tvSystem) {
            logger.info(`Setting TV system to '${tvSystem || "autodetection mode"}'`);
            this.tvSystem = tvSystem;
            this.nes.setTVSystem(tvSystemAliases[tvSystem]);
            if (this.isRunning()) {
                this.restart(); // To refresh step period
            }
        }
    }

    getTVSystem() {
        return this.tvSystem;
    }

    //=========================================================
    // Emulation speed
    //=========================================================

    setSpeed(speed = 1) {
        logger.info(`Setting emulation speed to ${speed}x`);
        if (this.speed !== speed) {
            this.speed = speed;
            this.audioManager.setSpeed(speed);
            if (this.isRunning()) {
                this.restart(); // To refresh step period
            }
        }
    }

    getSpeed() {
        return this.speed;
    }

    //=========================================================
    // FPS conting
    //=========================================================

    initFPS() {
        this.fpsTime = 0;
        this.fpsIndex = 0;
        this.fpsBuffer = new Array(10);
        clearArray(this.fpsBuffer);
    }

    updateFPS() {
        var timeNow = Date.now();
        this.fpsBuffer[this.fpsIndex] = 1000 / (timeNow - this.fpsTime);
        this.fpsIndex = (this.fpsIndex + 1) % this.fpsBuffer.length;
        this.fpsTime = timeNow;
    }

    getFPS() {
        var fpsSum = this.fpsBuffer.reduce((a, b) => a + b);
        return fpsSum / this.fpsBuffer.length;
    }

    getTargetFPS() {
        var tvSystem = this.nes.getTVSystem();
        switch (tvSystem) {
            case TVSystem.NTSC:
                return 60;
            case TVSystem.PAL:
                return 50;
            default:
                throw new Error(`Unknown TV system '${tvSystem}'`);
        }
    }

    //=========================================================
    // Configuration reading / writing
    //=========================================================

    readConfiguration(config) {
        logger.info("Reading execution manager configuration");
        return {
            "tvSystem": this.getTVSystem(),
            "speed":    this.getSpeed()
        }
    }

    writeConfiguration(config) {
        if (config) {
            logger.info("Writing execution manager configuration");
            this.setTVSystem(config["tvSystem"]);
            this.setSpeed(config["speed"]);
        }
    }


}
