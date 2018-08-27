#
# Makefile to build and test the riff-rtc client files and server
#   duplicates (and should be kept in sync with) some of the scripts in package.json
#

GIT_TAG_VERSION = $(shell git describe)

WEBPACK = ./node_modules/.bin/webpack
COFFEE = ./node_modules/.bin/coffee
LINT = ./node_modules/.bin/eslint
JEST = ./node_modules/.bin/jest
MOCHA = ./node_modules/.bin/mocha

LINT_LOG = logs/lint.log
TEST_LOG = logs/test.log

# Add --quiet to only report on errors, not warnings
LINT_OPTIONS =
LINT_FORMAT = stylish

# Pattern rules
# compile the .js file from the .coffee file
%.js : %.coffee
	$(COFFEE) --compile $<

.DELETE_ON_ERROR :
.PHONY : help all build doc lint test clean clean-build

help :
	@echo ""                                                                          ; \
	echo "Useful targets in this riff-rtc Makefile:"                                  ; \
	echo "- build     : build (webpack) the production client"                        ; \
	echo "- build-dev : build (webpack) the development client"                       ; \
	echo "- clean     : remove all files created by build"                            ; \
	echo "- init      : run install, build-dev; intended for initializing a fresh repo clone" ; \
	echo "- install   : run npm install"                                              ; \
	echo "------ the following are placeholder targets not yet implemented: -----"    ; \
	echo "- all       : run lint, build, test"                                        ; \
	echo "- lint      : run lint over the sources & tests; display results to stdout" ; \
	echo "- lint-log  : run lint concise diffable output to $(LINT_LOG)"              ; \
	echo "- test      : run the mocha (unit) tests"                                   ; \
	echo "- vim-lint  : run lint in format consumable by vim quickfix"                ; \
	echo ""

all : lint build test

init : install build-dev

install :
	npm install

build : src/libs/mm.js
	$(WEBPACK) --mode production --config webpack/webpack.config.js

build-dev : src/libs/mm.js
	$(WEBPACK) --mode development --config webpack/webpack.config.dev.js
	
doc :
	@echo doc would run the compiler: $(COMPILER)

lint-log: LINT_OPTIONS = --output-file $(LINT_LOG)
lint-log: LINT_FORMAT = unix
vim-lint: LINT_FORMAT = unix
lint vim-lint lint-log:
	$(LINT) $(LINT_OPTIONS) --format $(LINT_FORMAT) src test

test :
	@echo test would run $(MOCHA) --reporter spec test | tee $(TEST_LOG)

clean : clean-build

clean-build :
	-rm -fr build/* src/libs/mm.js
