angular.module "cfxnes"

.factory "globalParams", ->
    controlsInfoVisible: localStorage["controlsInfoDisabled"] isnt "true"
