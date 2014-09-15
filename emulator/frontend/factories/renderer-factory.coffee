logger = require("../../core/utils/logger").get()

FALLBACK_RENDERER = "canvas"

###########################################################
# Factory for renderer creation
###########################################################

class RendererFactory

    isRendererSupported: (id) ->
        try
            @getRendererClass(id).isSupported()
        catch
            false

    createRenderer: (id, canvas) ->
        try
            logger.info "Creating renderer '#{id}'"
            @createRendererUnsafe id, canvas
        catch error
            logger.error "Error when creating renderer '#{id}': #{error}"
            throw error if id is FALLBACK_RENDERER
            logger.info "Creating fallback renderer '#{FALLBACK_RENDERER}'"
            @createRendererUnsafe FALLBACK_RENDERER, canvas

    createRendererUnsafe: (id, canvas) ->
        rendererClass = @getRendererClass id
        new rendererClass canvas

    getRendererClass: (id) ->
        require "../renderers/#{id}-renderer"

module.exports = RendererFactory
