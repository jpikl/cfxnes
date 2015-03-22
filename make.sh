#!/bin/bash

#gulp compile
closure --compilation_level=ADVANCED_OPTIMIZATIONS\
        --language_in=ECMASCRIPT6\
        --language_out=ES5\
        --externs "emulator/externs/md5.js"\
        --externs "emulator/externs/screenfull.js"\
        --externs "emulator/externs/w3c_audio.js"\
         ./emulator/core/nes.js\
         ./emulator/core/channels/*.js\
         ./emulator/core/common/*.js\
         ./emulator/core/config/*.js\
         ./emulator/core/devices/*.js\
         ./emulator/core/factories/*.js\
         ./emulator/core/loaders/*.js\
         ./emulator/core/mappers/*.js\
         ./emulator/core/palettes/*.js\
         ./emulator/core/readers/*.js\
         ./emulator/core/storages/*.js\
         ./emulator/core/units/*.js\
         ./emulator/core/utils/*.js\
         ./emulator/frontend/*{,/*{,/*}}.js\
         > ./server/public/scripts/cfxnes.js\
