logger = require("../../core/utils/logger").get()

FALLBACK_RENDERER = "canvas"

###########################################################
# Factory for renderer creation
###########################################################

class RendererFactory

    createRenderer: (id, canvas) ->
        try
            @createRendererUnsafe id, canvas
        catch error
            logger.error "Unable to create reneder '#{id}': #{error}"
            if id is FALLBACK_RENDERER
                throw error
            logger.info "Using fallback renderer '#{FALLBACK_RENDERER}'"
            @createRendererUnsafe FALLBACK_RENDERER, canvas

    createRendererUnsafe: (id, canvas) ->
        rendererClass = require "../renderers/#{id}-renderer"
        new rendererClass canvas

module.exports = RendererFactory
