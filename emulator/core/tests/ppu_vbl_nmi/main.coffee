module.exports = (test) ->
    RESULT_ADDRESS = 0x6000
    RESULT_RUNNING = 0x80
    RESULT_OK = 0x00
    MESSAGE_ADDRESS = 0x6004

    test.step() until test.readByte(RESULT_ADDRESS) is RESULT_RUNNING
    test.step() while test.readByte(RESULT_ADDRESS) is RESULT_RUNNING

    result = test.readByte RESULT_ADDRESS
    message = test.readString MESSAGE_ADDRESS
    test.assert result is RESULT_OK, "\n#{message}"
