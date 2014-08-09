#!/bin/sh

readonly INPUT_FILE=./nintendulator-full.log
readonly OUTPUT_FILE=./nintendulator-simple.log
readonly LINES_COUNT=8991

sed "s/^\(.\{20\}\).\{27\}\(.\{26\}\).*$$/\1\2/g" ${INPUT_FILE} | sed "s/\*/ /g" | head -n ${LINES_COUNT} > ${OUTPUT_FILE}
