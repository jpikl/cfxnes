import { CanvasRenderer } from "../renderers/canvas-renderer";
import { WebGLRenderer }  from "../renderers/webgl-renderer";
import { logger }         from "../../core/utils/logger";

const FALLBACK_RENDERER = "canvas";

const renderers = {
    "canvas": CanvasRenderer,
    "webgl":  WebGLRenderer
}

//=========================================================
// Factory for renderer creation
//=========================================================

export class RendererFactory {

    isRendererSupported(id) {
        var clazz = renderers[id];
        return clazz && clazz["isSupported"]();
    }

    createRenderer(id, canvas) {
        try {
            logger.info(`Creating renderer '${id}'`);
            return this.createRendererUnsafe(id, canvas);
        } catch (error) {
            logger.error(`Error when creating renderer '${id}': ${error}`);
            if (id === FALLBACK_RENDERER) {
                throw error;
            }
            logger.info("Creating fallback renderer '${FALLBACK_RENDERER}'");
            return this.createRendererUnsafe(FALLBACK_RENDERER, canvas);
        }
    }

    createRendererUnsafe(id, canvas) {
        var clazz = renderers[id];
        if (!clazz) {
            throw new Error(`Unsupported renderer '${id}'`);
        }
        return new clazz(canvas);
    }

}
