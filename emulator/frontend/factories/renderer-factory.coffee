###########################################################
# Factory for renderer creation
###########################################################

class RendererFactory

    createRenderer: (id, canvas) ->
        rendererClass = require "../renderers/#{id}-renderer"
        new rendererClass canvas

module.exports = RendererFactory
