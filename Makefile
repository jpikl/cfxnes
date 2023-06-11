###############################################################################
# Configuration
###############################################################################

VERSION=0.7.0
RELEASE_FILE=cfxnes-$(VERSION).zip
DEPLOY_BASE_URL=/cfxnes
DEPLOY_DIR=../jpikl.github.io$(DEPLOY_BASE_URL)
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
	@echo "	app_static	Build application (static site)"
	@echo ""
	@echo "	tag							Tag current version in git"
	@echo "	version					Update version in package.json"
	@echo "	deploy					Deploy application"
	@echo "	deploy_static		Deploy application (static site)"
	@echo "	release					Create release"
	@echo "	backup					Backup project"
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

.PHONY: lib lib_dbg app app_static

lib:
	cd lib && npm -s run build

lib_dbg:
	cd lib && npm -s run build:debug

app: lib
	cd app && npm -s run build

app_static: lib
	cd app && npm -s run build:static

###############################################################################
# Release
###############################################################################

.PHONY: tag version deploy deploy_static release backup

tag:
	git tag -a v$(VERSION) -m "Version $(VERSION)"

version:
	cd core && npm -s version $(VERSION); true
	cd lib && npm -s version $(VERSION); true
	cd app && npm -s version $(VERSION); true

deploy: export BASE_URL=$(DEPLOY_BASE_URL)

deploy: clean_deploy clean lib app
	cp -rt $(DEPLOY_DIR) app/dist/node/*
	cd $(DEPLOY_DIR) && npm install --production

deploy_static: export BASE_URL=$(DEPLOY_BASE_URL)

deploy_static: clean_deploy clean lib app_static
	node ./app/dist/rom-import.js $(DEPLOY_DIR)/.roms
	cp -rt $(DEPLOY_DIR) app/dist/static/*

release: clean lib lib_dbg app app_static
	mkdir -p $(TEMP_DIR)/{lib,app}
	cp -rt $(TEMP_DIR) *.md logo.png
	cp -rt $(TEMP_DIR)/lib lib/dist/* lib/*.md lib/polyfills.js
	cp -rt $(TEMP_DIR)/app app/dist/* app/*.md
	cd $(TEMP_DIR)/app/node && npm install --production
	rm $(TEMP_DIR)/app/node/package{,-lock}.json
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

.PHONY: clean clean_all clean_deploy

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

clean_deploy:
	rm -rf $(DEPLOY_DIR)/*
	mkdir -p $(DEPLOY_DIR)
