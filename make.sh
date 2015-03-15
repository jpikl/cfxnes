#!/bin/bash

#gulp compile
closure --compilation_level=ADVANCED_OPTIMIZATIONS\
        --process_common_js_modules\
        --externs "emulator/externs/md5.js"\
        --externs "emulator/externs/screenfull.js"\
        --externs "emulator/externs/w3c_audio.js"\
        --common_js_entry_module=./build/frontend/emulator.js\
         ./emulator/*/*.js ./emulator/*/*/*.js ./emulator/*/*/*/*.js > ./server/public/scripts/cfxnes.js\
         ./node_modules/js-md5/src/md5.js
