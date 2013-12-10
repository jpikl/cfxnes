SRC_DIR   = src
BUILD_DIR = build
MAIN_FILE = Main.js
OUT_FILE  = NESCoffee.js
OPT_LEVEL = ADVANCED_OPTIMIZATIONS

all: compile optimize

init:
	mkdir -p $(BUILD_DIR)

compile: init
	coffee --compile --output $(BUILD_DIR) $(SRC_DIR)
	browserify $(BUILD_DIR)/$(MAIN_FILE) --outfile $(BUILD_DIR)/$(OUT_FILE)

optimize: compile
	closure --compilation_level $(OPT_LEVEL) $(BUILD_DIR)/$(OUT_FILE) > $(OUT_FILE)

clean:
	rm -rf $(BUILD_DIR)
	rm -rf $(OUT_FILE)
