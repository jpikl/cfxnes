Injector = require "./utils/Injector"

FPS = 60

injector = new Injector "./config/BaseConfig"
nes = injector.getInstance "nes"
cartridgeFactory = injector.getInstance "cartridgeFactory"

window.onload = ->
    canvas = document.getElementById "screen"
    context = canvas.getContext "2d"
    imageData = context.createImageData 256, 240

    drawFrame = ->
        imageData.data.set nes.renderFrame()
        context.putImageData imageData, 0, 0

    setInterval drawFrame, 1000 / FPS
