###############################################################################
# Configuration
###############################################################################

VERSION=0.4.0
RELEASE_FILE=cfxnes-$(VERSION).zip
DEPLOY_DIR=../cfxnes-heroku
BACKUP_DIR=~/Dropbox/Backup/projects
BACKUP_FILE=cfxnes.zip
TEMP_DIR=temp

###############################################################################
# Default target
###############################################################################

all: debug_lib lib app

###############################################################################
# Dependency management
###############################################################################

.PHONY: install_deps check_deps update_deps

install_deps:
	cd core && npm install
	cd lib && npm install
	cd app && npm install

check_deps:
	cd core && ncu
	cd lib && ncu
	cd app && ncu

update_deps:
	cd core && ncu -a
	cd lib && ncu -a
	cd app && ncu -a

###############################################################################
# Build
###############################################################################

.PHONY: all debug_lib lib app prod_app

debug_lib:
	cd lib && gulp build -d

lib:
	cd lib && gulp build

app:
	cd app && gulp build

prod_app:
	cd app && gulp build -a

###############################################################################
# Development
###############################################################################

.PHONY: dev_lib dev_app run

dev_lib:
	cd lib && gulp -d

dev_app:
	cd app && gulp -d

run:
	node app/dist/app.js

###############################################################################
# Release
###############################################################################

.PHONY: version deploy backup release tag

version:
	cd core && npm version $(VERSION); true
	cd lib && npm version $(VERSION); true
	cd app && npm version $(VERSION); true

deploy: clean lib prod_app
	mkdir -p $(DEPLOY_DIR)
	rm -rf ./$(DEPLOY_DIR)/{node_modules,static,*.js,package.json}
	cd app/dist && cp -r . ../../$(DEPLOY_DIR)
	cp app/package.json $(DEPLOY_DIR)
	cd $(DEPLOY_DIR) && npm install --production

backup: clean
	zip -r $(BACKUP_FILE) . -x ".git/*" -x "*/node_modules/*"
	mv $(BACKUP_FILE) $(BACKUP_DIR)

release: clean all
	mkdir $(TEMP_DIR)
	cp lib/dist/* $(TEMP_DIR)
	cp -r app/dist $(TEMP_DIR)/app
	cp app/package.json $(TEMP_DIR)/app
	cd $(TEMP_DIR) && zip -r ../$(RELEASE_FILE) .

tag:
	git tag -a v$(VERSION) -m "Version $(VERSION)"

###############################################################################
# Tests
###############################################################################

.PHONY: lint test

lint:
	cd core && gulp lint
	cd lib && gulp lint
	cd app && gulp lint

test:
	cd core && gulp test
	cd lib && gulp test

###############################################################################
# Cleanup
###############################################################################

.PHONY: clean clean_all

clean:
	rm -f ./$(BACKUP_FILE)
	rm -f ./$(RELEASE_FILE)
	rm -rf ./$(TEMP_DIR)
	rm -rf ./lib/dist
	rm -rf ./app/dist

clean_all: clean
	rm -rf ./core/node_modules
	rm -rf ./lib/node_modules
	rm -rf ./app/node_modules
