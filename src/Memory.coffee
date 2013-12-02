            
###########################################################
# CPU memory
###########################################################

class Memory

    constructor: ->
        @ram = 0 for [0...0x07FF] # Mirrored in 0...0x2000

    read: (address) ->
        switch address
            when address < 0x2000 then @ram[address & 0x07FF]

    write: (address, value) ->
        switch address
            when address < 0x2000 then @ram[address & 0x07FF] = value

module.exports = Memory
