###############################################################################
# Configuration
###############################################################################

VERSION=0.7.0
RELEASE_FILE=cfxnes-$(VERSION).zip
DEPLOY_DIR=../cfxnes-heroku
BACKUP_FILE=cfxnes.zip
TEMP_DIR=temp

###############################################################################
# Help
###############################################################################

help:
	@echo "Make targets:"
	@echo "	install			Install npm packages"
	@echo ""
	@echo "	lib					Build library"
	@echo "	lib_dbg			Build library (debug version)"
	@echo "	app					Build application"
	@echo ""
	@echo "	tag					Tag current version in git"
	@echo "	version			Update version in package.json"
	@echo "	deploy			Deploy application"
	@echo "	release			Create release"
	@echo "	backup			Backup project"
	@echo ""
	@echo "	lint				Run linter"
	@echo "	test				Run tests"
	@echo ""
	@echo "	clean				Delete generated files"
	@echo "	clean_all		Delete generated files and installed npm packages"

###############################################################################
# NPM
###############################################################################

.PHONY: install

install:
	cd core && npm install
	cd lib && npm install
	cd app && npm install

###############################################################################
# Build
###############################################################################

.PHONY: lib lib_dbg app

lib:
	cd lib && npm -s run build

lib_dbg:
	cd lib && npm -s run build:debug

app: lib
	cd app && npm -s run build

###############################################################################
# Release
###############################################################################

.PHONY: tag version deploy release backup

tag:
	git tag -a v$(VERSION) -m "Version $(VERSION)"

version:
	cd core && npm -s version $(VERSION); true
	cd lib && npm -s version $(VERSION); true
	cd app && npm -s version $(VERSION); true

deploy: clean lib app
	mkdir -p $(DEPLOY_DIR)
	rm -rf ./$(DEPLOY_DIR)/{node_modules,static,*.js,package.json}
	cd app/dist && cp -r . ../../$(DEPLOY_DIR)/
	cp app/package.json $(DEPLOY_DIR)/
	cd $(DEPLOY_DIR) && npm install --production

release: clean lib_dbg app
	mkdir $(TEMP_DIR)
	cp -r lib/dist $(TEMP_DIR)/lib
	cp lib/*.md lib/polyfills.js $(TEMP_DIR)/lib/
	cp -r app/dist $(TEMP_DIR)/app
	cp app/*.md $(TEMP_DIR)/app/
	cp app/package{,-lock}.json $(TEMP_DIR)/app/
	cp *.md *.txt logo.png $(TEMP_DIR)/
	cd $(TEMP_DIR)/app && npm install --production
	rm $(TEMP_DIR)/app/package{,-lock}.json
	cd $(TEMP_DIR) && zip -r ../$(RELEASE_FILE) .

backup: clean
	zip -r $(BACKUP_FILE) . -x ".git/*" -x "*/node_modules/*"
	mv $(BACKUP_FILE) $(BACKUP_DIR)/

###############################################################################
# Lint & Test
###############################################################################

.PHONY: lint test

lint:
	cd core && npm -s run lint
	cd lib && npm -s run lint
	cd app && npm -s run lint

test:
	cd core && npm -s test
	cd lib && npm -s test
	cd app && npm -s test

###############################################################################
# Clean
###############################################################################

.PHONY: clean clean_all

clean:
	cd core && npm run clean
	cd lib && npm run clean
	cd app && npm run clean
	rm -rf ./$(TEMP_DIR)
	rm -f ./$(BACKUP_FILE)
	rm -f ./$(RELEASE_FILE)

clean_all: clean
	rm -rf ./core/node_modules
	rm -rf ./lib/node_modules
	rm -rf ./app/node_modules
