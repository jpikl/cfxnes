###############################################################################
# Configuration
###############################################################################

VERSION=0.4.0
DIST_FILE=cfxnes-$(VERSION).zip
DEPLOY_DIR=../cfxnes-heroku
BACKUP_DIR=~/Dropbox/Backup/projects
BACKUP_FILE=cfxnes.zip

###############################################################################
# Dependency management
###############################################################################

.PHONY: install_deps check_deps update_deps

install_deps:
	cd core && npm install
	cd lib && npm install
	cd app && npm install
	cd dbg && npm install

check_deps:
	cd core && ncu
	cd lib && ncu
	cd app && ncu
	cd dbg && ncu

update_deps:
	cd core && ncu -a
	cd lib && ncu -a
	cd app && ncu -a
	cd dbg && ncu -a

###############################################################################
# Build
###############################################################################

.PHONY: build_all build_debug_lib build_lib build_app build_prod_app

build_all: build_debug_lib build_lib build_app

build_debug_lib:
	cd lib && gulp build -d

build_lib:
	cd lib && gulp build

build_app:
	cd app && gulp build

build_prod_app:
	cd app && gulp build -a

###############################################################################
# Development
###############################################################################

.PHONY: dev_lib dev_app

dev_lib:
	cd lib && gulp -d

dev_app:
	cd app && gulp -d

###############################################################################
# Production
###############################################################################

.PHONY: backup deploy

deploy: clean build_lib build_prod_app
	mkdir -p $(DEPLOY_DIR)
	rm -rf $(DEPLOY_DIR)/{node_modules,services,static,app.js,package.json}
	cd app/dist && cp -r . ../../$(DEPLOY_DIR)
	cp app/package.json $(DEPLOY_DIR)
	cd $(DEPLOY_DIR) && npm install --production

backup: clean
	zip -r $(BACKUP_FILE) . -x ".git/*" -x "*/node_modules/*"
	cp $(BACKUP_FILE) $(BACKUP_DIR)

###############################################################################
# Tests
###############################################################################

.PHONY: validate test

validate:
	cd core && gulp validate
	cd lib && gulp validate
	cd app && gulp validate

test:
	cd core && gulp test
	cd lib && gulp test
	cd dbg && gulp test

###############################################################################
# Cleanup
###############################################################################

.PHONY: clean clean_all

clean:
	rm -f $(BACKUP_FILE)
	rm -f $(DIST_FILE)
	rm -rf lib/dist
	rm -rf app/dist

clean_all: clean
	rm -rf core/node_modules
	rm -rf lib/node_modules
	rm -rf app/node_modules
	rm -rf dbg/node_modules
