#!/bin/bash

gulp compile
closure --process_common_js_modules --common_js_entry_module=./build/frontend/emulator.js ./build/*/*.js ./build/*/*/*.js ./build/*/*/*/*.js > ./server/public/scripts/cfxnes.js
