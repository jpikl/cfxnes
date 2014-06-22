export NODE_PATH = /usr/lib/node_modules/

COFFEE = /usr/bin/coffee

APP_FILE    = Application.coffee
WATCH_FILES = $(APP_FILE)

all: run

run:
	@while true; do \
	    echo Restarting application; \
	    killall -q node; \
	    coffee $(APP_FILE) --debug-mode & \
	    inotifywait -q -e modify $(WATCH_FILES); \
	done
