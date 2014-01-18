export NODE_PATH = /usr/lib/node_modules/

SRC_DIR     = src
BUILD_DIR   = js
MAIN_FILE   = NESCoffee.js
BUNDLE_FILE = NESCoffeeBundled.js
OPT_FILE    = NESCoffeeOptimized.js
OPT_LEVEL   = SIMPLE_OPTIMIZATIONS

INCLUDES = NESCoffee.js \
		   Binder.js \
           NES.js \
           APU.js \
           CPU.js \
           CPUMemory.js \
           DMA.js \
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
           mappers/UNROMMapper.js \
           readers/AbstractReader.js \
           readers/ArrayBufferReader.js \
           controllers/Joypad.js \
           controllers/Zapper.js \
           utils/Format.js \
           utils/Injector.js

all: optimize

init:
	mkdir -p $(BUILD_DIR)

compile: init
	coffee --compile --output $(BUILD_DIR) $(SRC_DIR)

bundle: compile
	coffee tools/Bundler.coffee --directory $(BUILD_DIR) --entry $(MAIN_FILE) --output $(BUNDLE_FILE) $(INCLUDES)

optimize: bundle
	cd $(BUILD_DIR) && closure --compilation_level $(OPT_LEVEL) $(BUNDLE_FILE) > $(OPT_FILE)

clean:
	rm -rf $(BUILD_DIR)
