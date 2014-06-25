export NODE_PATH = /usr/lib/node_modules/

COMPILER = ./bin/compiler.coffee
BUNDLER  = ./bin/bundler.coffee
CLOSURE  = /usr/bin/closure

OPT_LEVEL  = SIMPLE_OPTIMIZATIONS

SRC_DIR    = src
LIB_DIR    = lib
BUILD_DIR  = build
APP_DIR    = ../nescoffee-app
DST_DIR    = $(APP_DIR)/build/scripts

ENTRY_FILE   = nescoffee.js
DST_FILE     = nescoffee.js
DST_OPT_FILE = nescoffee.opt.js

SRC_FILES = common/types.js \
            config/base-config.js \
            controllers/joypad.js \
            controllers/zapper.js \
            factories/cartridge-factory.js \
            factories/loader-factory.js \
            factories/mapper-factory.js\
            loaders/abstract-loader.js \
            loaders/ines-loader.js \
            loaders/nes2-loader.js \
            mappers/abstract-mapper.js \
            mappers/aorom-mapper.js \
            mappers/cnrom-mapper.js \
            mappers/mmc1-mapper.js \
            mappers/mmc3-mapper.js \
            mappers/nrom-mapper.js \
            mappers/unrom-mapper.js \
            paletts/bright-palette.js \
            paletts/default-palette.js \
            paletts/realistic-palette.js \
            readers/abstract-reader.js \
            readers/array-buffer-reader.js \
            storages/local-storage.js \
            units/apu.js \
            units/cpu.js \
            units/cpu-memory.js \
            units/dma.js \
            units/nes.js \
            units/ppu.js \
            units/ppu-memory.js \
            utils/binder.js \
            utils/convert.js \
            utils/format.js \
            utils/injector.js \
            utils/logger.js \
            utils/network.js \
            nescoffee.js

LIB_FILES   = md5sum.js screenfull.js

BUILD_FILES = $(BUILD_DIR)     $(addprefix $(BUILD_DIR)/,     $(SRC_FILES)) \
              $(BUILD_DIR)/lib $(addprefix $(BUILD_DIR)/lib/, $(LIB_FILES))

all: bundle

compile: $(BUILD_FILES)

bundle: $(DST_DIR)/$(DST_FILE)

optimize: $(DST_DIR)/$(DST_OPT_FILE)

clean:
	@echo Cleaning generated files and directories
	@rm -rf $(BUILD_DIR)
	@rm -f $(DST_DIR)/$(DST_FILE)
	@rm -f $(DST_DIR)/$(DST_OPT_FILE)

$(BUILD_DIR):
	@echo Creating $(@) directory
	@mkdir -p $(@)

$(BUILD_DIR)/%.js: $(SRC_DIR)/%.coffee
	@echo -e Compiling $(<) to $(@)
	@$(COMPILER) --compile --inline --output $(subst $(SRC_DIR), $(BUILD_DIR), $(<D)) $(<)

$(BUILD_DIR)/lib:
	@echo Creating $(@) directory
	@mkdir -p $(@)

$(BUILD_DIR)/lib/%.js: $(LIB_DIR)/%.js
	@echo Copying library $(<) to $(@)
	@cp $(<) $(@)

$(DST_DIR)/$(DST_FILE): $(BUILD_FILES)
	@echo Bundling build files to $(@)
	@$(BUNDLER) --directory $(BUILD_DIR) --entry $(ENTRY_FILE) --output ../$(DST_DIR)/$(DST_FILE) $(SRC_FILES) $(addprefix lib/, $(LIB_FILES))

$(DST_DIR)/$(DST_OPT_FILE): $(DST_DIR)/$(DST_FILE)
	@echo Optimizing $(<) to $(@)
	@cd $(DST_DIR) && $(CLOSURE) --compilation_level $(OPT_LEVEL) $(DST_FILE) > $(DST_OPT_FILE)
