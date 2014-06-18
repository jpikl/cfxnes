export NODE_PATH = /usr/lib/node_modules/

COFFEE   = /usr/bin/coffee
SASSC    = /usr/bin/sassc
CLOSURE  = /usr/bin/closure
COMPILER = tools/Compiler.coffee
BUNDLER  = tools/Bundler.coffee

COFFEE_DIR  = coffee
JS_DIR      = js
SCSS_DIR    = scss
CSS_DIR     = css
LIB_JS_DIR  = lib/js
LIB_CSS_DIR = lib/css
SERVER_DIR  = ../nescoffee-heroku
DEPLOY_DIR  = $(SERVER_DIR)/public/

MAIN_FILE    = NESCoffee.js
BUNDLE_FILE  = NESCoffeeBundled.js
UI_FILE      = UI.js
OPT_FILE     = NESCoffeeOptimized.js
OPT_LEVEL    = SIMPLE_OPTIMIZATIONS

DEPLOY_FILES = $(JS_DIR)/$(OPT_FILE) $(JS_DIR)/$(UI_FILE) css/*.css img/* index.html

JS_FILES = NESCoffee.js \
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

JS_LIB_FILES  = lib/md5sum.js lib/screenfull.js

CSS_FILES     = style.css
CSS_LIB_FILES =

all: bundle

bundle: $(JS_DIR)/$(BUNDLE_FILE) $(JS_DIR)/$(UI_FILE) $(CSS_DIR)/$(CSS_FILES)

optimize: bundle $(JS_DIR)/$(OPT_FILE)

deploy: optimize
	cp --parents $(DEPLOY_FILES) $(DEPLOY_DIR)
	sed -i "s/$(BUNDLE_FILE)/$(OPT_FILE)/g" $(DEPLOY_DIR)/index.html

run: deploy
	cd $(SERVER_DIR) && $(COFFEE) Application.coffee

publish: deploy
	cd $(DEPLOY_DIR) && git add . && git commit && git push

clean:
	rm -f $(addprefix $(JS_DIR)/, $(JS_FILES) $(UI_FILE) $(BUNDLE_FILE) $(OPT_FILE))
	rm -f $(addprefix $(CSS_DIR)/, $(CSS_FILES))
	rmdir --ignore-fail-on-non-empty $(JS_DIR)/*

$(JS_DIR)/%.js: $(COFFEE_DIR)/%.coffee
	$(COMPILER) --compile --inline --output $(subst $(COFFEE_DIR), $(JS_DIR), $(<D)) $(<)

$(CSS_DIR)/%.css: $(SCSS_DIR)/%.scss
	$(SASSC) -o $(@) $(<)

$(JS_DIR)/$(BUNDLE_FILE): $(addprefix $(JS_DIR)/, $(JS_FILES) $(JS_LIB_FILES))
	$(BUNDLER) --directory $(JS_DIR) --entry $(MAIN_FILE) --output $(BUNDLE_FILE) $(JS_FILES) $(JS_LIB_FILES)

$(JS_DIR)/$(OPT_FILE): $(JS_DIR)/$(BUNDLE_FILE)
	cd $(JS_DIR) && $(CLOSURE) --compilation_level $(OPT_LEVEL) $(BUNDLE_FILE) > $(OPT_FILE)
