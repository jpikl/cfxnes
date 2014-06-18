export NODE_PATH = /usr/lib/node_modules/

SRC_DIR      = src
BUILD_DIR    = js
MAIN_FILE    = NESCoffee.js
BUNDLE_FILE  = NESCoffeeBundled.js
OPT_FILE     = NESCoffeeOptimized.js
OPT_LEVEL    = SIMPLE_OPTIMIZATIONS
SERVER_DIR   = ../nescoffee-heroku
DEPLOY_DIR   = $(SERVER_DIR)/public/
DEPLOY_FILES = $(BUILD_DIR)/$(OPT_FILE) $(BUILD_DIR)/UI.js css/*.css img/* index.html

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
           loaders/NES2Loader.js \
           mappers/AbstractMapper.js \
           mappers/NROMMapper.js \
           mappers/UNROMMapper.js \
           mappers/CNROMMapper.js \
           mappers/MMC1Mapper.js \
           mappers/MMC3Mapper.js \
           mappers/AOROMMapper.js \
           readers/AbstractReader.js \
           readers/ArrayBufferReader.js \
           controllers/Joypad.js \
           controllers/Zapper.js \
           utils/Convert.js \
           utils/Format.js \
           utils/Injector.js \
           utils/Logger.js \
           utils/Network.js \
           paletts/BrightPalette.js \
           paletts/DefaultPalette.js \
           paletts/RealisticPalette.js \
           storages/LocalStorage.js

LIBS = lib/md5sum.js lib/screenfull.js

all: bundle

init:
	mkdir -p $(BUILD_DIR)
	mkdir -p css

js: init
	tools/Compiler.coffee --inline --compile --output $(BUILD_DIR) $(SRC_DIR)
	cp --parents $(LIBS) $(BUILD_DIR)

css: init scss/style.scss
	sassc -o css/style.css scss/style.scss

bundle: js css
	tools/Bundler.coffee --directory $(BUILD_DIR) --entry $(MAIN_FILE) --output $(BUNDLE_FILE) $(INCLUDES) $(LIBS)

optimize: bundle
	cd $(BUILD_DIR) && closure --compilation_level $(OPT_LEVEL) $(BUNDLE_FILE) > $(OPT_FILE)

deploy: optimize
	cp --parents $(DEPLOY_FILES) $(DEPLOY_DIR)
	sed -i "s/$(BUNDLE_FILE)/$(OPT_FILE)/g" $(DEPLOY_DIR)/index.html

run: deploy
	cd $(SERVER_DIR) && coffee Application.coffee

publish: deploy
	cd $(DEPLOY_DIR) && git add . && git commit && git push

clean:
	rm -rf $(BUILD_DIR)
	rm -rf css
