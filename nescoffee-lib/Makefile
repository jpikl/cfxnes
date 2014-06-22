export NODE_PATH = /usr/lib/node_modules/

COMPILER = tools/Compiler.coffee
BUNDLER  = tools/Bundler.coffee
CLOSURE  = /usr/bin/closure

OPT_LEVEL  = SIMPLE_OPTIMIZATIONS

SRC_DIR    = src
LIB_DIR    = lib
BUILD_DIR  = build
DST_DIR    = ../nescoffee-app/public/js

ENTRY_FILE   = NESCoffee.js
DST_FILE     = nescoffee.js
DST_OPT_FILE = nescoffee.opt.js

SRC_FILES = NESCoffee.js \
            NES.js \
            CPU.js \
            PPU.js \
            APU.js \
            DMA.js \
            CPUMemory.js \
            PPUMemory.js \
            CartridgeFactory.js \
            LoaderFactory.js \
            MapperFactory.js\
            Types.js \
            Binder.js \
            config/BaseConfig.js \
            controllers/Joypad.js \
            controllers/Zapper.js \
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
            paletts/BrightPalette.js \
            paletts/DefaultPalette.js \
            paletts/RealisticPalette.js \
            readers/AbstractReader.js \
            readers/ArrayBufferReader.js \
            storages/LocalStorage.js \
            utils/Convert.js \
            utils/Format.js \
            utils/Injector.js \
            utils/Logger.js \
            utils/Network.js

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
