import { VIDEO_WIDTH, VIDEO_HEIGHT } from "../../core/common/constants";
import { logger }                    from "../../core/utils/logger";

//=========================================================
// Video manager
//=========================================================

export class VideoManager {

    constructor() {
        this.dependencies = ["nes", "rendererFactory", "paletteFactory", "screenfull"];
    }

    inject(nes, rendererFactory, paletteFactory, screenfull) {
        logger.info("Initializing video manager");
        this.nes = nes;
        this.rendererFactory = rendererFactory;
        this.paletteFactory = paletteFactory;
        this.screenfull = screenfull;
        this.initListeners();
        this.setDefaults();
    }

    initListeners() {
        if (this.screenfull) {
            document.addEventListener(this.screenfull.raw.fullscreenchange, () => this.onFullscreenChange());
        }
    }

    setDefaults() {
        logger.info("Using default video configuration");
        this.setDebugging();
        this.setSmoothing();
        this.setScale();
        this.setPalette();
        this.setRenderer();
    }

    //=========================================================
    // Canvas
    //=========================================================

    setCanvas(canvas) {
        logger.info(`Setting video output to ${canvas}`);
        this.canvas = canvas;
        if (this.canvas) {
            this.updateCanvasSize();
            this.createRenderer();
            this.drawFrame();
        }
    }

    updateCanvasSize() {
        var widthMultiplier = this.debugging ? 2 : 1;
        this.canvas.width = this.scale * VIDEO_WIDTH * widthMultiplier;
        this.canvas.height = this.scale * VIDEO_HEIGHT;
    }

    getOutputRect() {
        if (this.canvas) {
            var rect = this.getCanvasRect();
            if (this.debugging) {
                rect.right -= (rect.right - rect.left) / 2; // Without debugging output
            }
            return rect;
        } else {
            return this.getEmptyRect();
        }
    }

    getCanvasRect() {
        var rect = this.canvas.getBoundingClientRect(); // Read-only, we need a writable copy
        return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left };
    }

    getEmptyRect() {
        return { top: -1, right: -1, bottom: -1, left: -1 };
    }

    //=========================================================
    // Renderering
    //=========================================================

    isRendererSupported(id) {
        return this.rendererFactory.isRendererSupported(id);
    }

    setRenderer(id = "webgl") {
        if (this.rendererId !== id) {
            logger.info(`Using '${id}' video renderer`);
            this.rendererId = id;
            if (this.canvas) {
                this.createRenderer();
            }
        }
    }

    getRenderer() {
        return this.rendererId;
    }

    createRenderer() {
        this.renderer = this.rendererFactory.createRenderer(this.rendererId, this.canvas);
        this.renderer.setSmoothing(this.smoothing);
        this.renderer.setScale(this.scale);
        this.frame = this.renderer.createFrame(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        this.debugFrame = this.renderer.createFrame(VIDEO_WIDTH, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    }

    renderFrame() {
        this.nes.renderFrame(this.frame.data);
        if (this.debugging) {
            this.nes.renderDebugFrame(this.debugFrame.data);
        }
    }

    drawFrame() {
        this.renderer.begin();
        this.renderer.drawFrame(this.frame);
        if (this.debugging) {
            this.renderer.drawFrame(this.debugFrame);
        }
        this.renderer.end();
    }

    //=========================================================
    // Debugging
    //=========================================================

    setPalette(id = "default") {
        if (this.paletteId !== id) {
            logger.info("Setting video palette to '" + id + "'");
            this.paletteId = id;
            this.nes.setPalette(this.paletteFactory.createPalette(id));
        }
    }

    getPalette() {
        return this.paletteId;
    }

    //=========================================================
    // Palette
    //=========================================================

    setDebugging(enabled = false) {
        if (this.debugging !== enabled) {
            logger.info(`Setting video debugging to ${enabled ? "on" : "off"}`);
            this.debugging = enabled;
            if (this.canvas) {
                this.updateCanvasSize();
                this.drawFrame();
            }
        }
    }

    isDebugging() {
        return this.debugging;
    }

    //=========================================================
    // Smoothing
    //=========================================================

    setSmoothing(enabled = false) {
        if (this.smoothing !== enabled) {
            logger.info(`Setting video smoothing to ${enabled ? "on" : "off"}`);
            this.smoothing = enabled;
            if (this.canvas) {
                if (this.renderer) {
                    this.renderer.setSmoothing(enabled);
                }
                this.drawFrame();
            }
        }
    }

    isSmoothing() {
        return this.smoothing;
    }

    //=========================================================
    // Scalling
    //=========================================================

    setScale(scale = 1) {
        if (this.scale !== scale && scale >= 1 && scale <= this.getMaxScale()) {
            logger.info(`Setting video scale to ${scale}`);
            this.scale = scale;
            if (this.canvas) {
                this.updateCanvasSize();
                this.renderer.setScale(scale);
                this.drawFrame();
            }
        }
    }

    getScale() {
        return this.scale;
    }

    getMaxScale() {
        return ~~Math.min(screen.width / VIDEO_WIDTH, screen.height / VIDEO_HEIGHT);
    }

    //=========================================================
    // Fullscreen
    //=========================================================

    setFullScreen(fullscreen) {
        if (fullscreen) {
            this.enterFullScreen();
        } else {
            this.leaveFullScreen();
        }
    }

    enterFullScreen() {
        this.checkScreenfullAvailable();
        if (this.screenfull.enabled && !this.isFullScreen()) {
            logger.info("Entering fullscreen");
            this.screenfull.request(this.canvas);
        }
    }

    leaveFullScreen() {
        this.checkScreenfullAvailable();
        if (this.screenfull.enabled && this.isFullScreen()) {
            logger.info("Leaving fullscreen");
            this.screenfull.exit();
        }
    }

    onFullscreenChange() {
        logger.info(`Fullscreen ${this.isFullScreen() ? "enabled" : "disabled"}`);
        if (this.isFullScreen()) {
            this.prevScale = this.scale;
            this.setScale(this.getMaxScale());
        } else {
            this.setScale(this.prevScale);
            this.prevScale = null;
        }
    }

    isFullScreen() {
        return this.screenfull && this.screenfull.isFullscreen;
    }

    checkScreenfullAvailable() {
        if (this.screenfull == null) {
            throw new Error("Unable to switch fullscreen: screenfull library is not available.");
        }
    }

    //=========================================================
    // Configuration
    //=========================================================

    readConfiguration(config) {
        logger.info("Reading video configuration");
        config["videoDebugging"] = this.isDebugging();
        config["videoSmoothing"] = this.isSmoothing();
        config["videoScale"] = this.getScale();
        config["videoPalette"] = this.getPalette();
        config["videoRenderer"] = this.getRenderer();

    }

    writeConfiguration(config) {
        logger.info("Writing video configuration");
        if (config["videoDebugging"] !== undefined) this.setDebugging(config["videoDebugging"]);
        if (config["videoSmoothing"] !== undefined) this.setSmoothing(config["videoSmoothing"]);
        if (config["videoScale"] !== undefined) this.setScale(config["videoScale"]);
        if (config["videoPalette"] !== undefined) this.setPalette(config["videoPalette"]);
        if (config["videoRenderer"] !== undefined) this.setRenderer(config["videoRenderer"]);
    }

}
