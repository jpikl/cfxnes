export NODE_PATH = /usr/lib/node_modules/

SRC_DIR   = src
BUILD_DIR = build
MAIN_FILE = Main.js
OUT_FILE  = NESCoffee.js
OPT_LEVEL = SIMPLE_OPTIMIZATIONS

INCLUDES = Main.js \
		   Binder.js \
           NES.js \
           APU.js \
           CPU.js \
           CPUMemory.js \
           PPU.js \
           PPUMemory.js \
           CartridgeFactory.js \
           LoaderFactory.js \
           MapperFactory.js\
           Types.js \
           config/BaseConfig.js \
           loaders/AbstractLoader.js \
           loaders/INESLoader.js \
           mappers/NROMMapper.js \
           readers/AbstractReader.js \
           readers/ArrayBufferReader.js \
           controllers/Joypad.js \
           controllers/Zapper.js \
           utils/Format.js \
           utils/Injector.js

all: compile optimize

init:
	mkdir -p $(BUILD_DIR)

compile: init
	coffee --compile --output $(BUILD_DIR) $(SRC_DIR)

compress: compile
	coffee tools/bundle.coffee --directory $(BUILD_DIR) $(INCLUDES) --entry $(MAIN_FILE) --output $(OUT_FILE)

optimize: compress
	closure --compilation_level $(OPT_LEVEL) $(BUILD_DIR)/$(OUT_FILE) > $(OUT_FILE)

clean:
	rm -rf $(BUILD_DIR)
	rm -rf $(OUT_FILE)
