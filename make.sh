#!/bin/bash

#gulp compile
closure --compilation_level=ADVANCED_OPTIMIZATIONS\
        --language_in=ECMASCRIPT6\
        --language_out=ES5\
        --externs "externs/md5.js"\
        --externs "externs/screenfull.js"\
        --externs "externs/w3c_audio.js"\
         ./src/lib/core/nes.js\
         ./src/lib/core/channels/*.js\
         ./src/lib/core/common/*.js\
         ./src/lib/core/config/*.js\
         ./src/lib/core/devices/*.js\
         ./src/lib/core/factories/*.js\
         ./src/lib/core/loaders/*.js\
         ./src/lib/core/mappers/*.js\
         ./src/lib/core/palettes/*.js\
         ./src/lib/core/readers/*.js\
         ./src/lib/core/storages/*.js\
         ./src/lib/core/units/*.js\
         ./src/lib/core/utils/*.js\
         ./src/lib/browser/*{,/*{,/*}}.js\
         > ./src/app/server/public/scripts/cfxnes.js\
