#!/bin/bash

#gulp compile
closure --compilation_level=ADVANCED_OPTIMIZATIONS\
        --language_in=ECMASCRIPT6\
        --language_out=ES5\
        --externs "emulator/externs/md5.js"\
        --externs "emulator/externs/screenfull.js"\
        --externs "emulator/externs/w3c_audio.js"\
         ./emulator/core/*{,/*}.js ./emulator/frontend/*{,/*{,/*}}.js > ./server/public/scripts/cfxnes.js\
