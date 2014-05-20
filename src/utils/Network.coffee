###########################################################
# Network utilities
###########################################################

Network =

    isLocalhost: (url) ->
        url or= document?.URL or ""
        for pattern in [ "file://", "localhost", "127.0.0.1" ]
            return true if url.indexOf pattern >= 0
        return false

module.exports = Network
