ZBAR_VERSION = 0.23.90
ZBAR_SRC = zbar-$(ZBAR_VERSION)

SRC = src
BUILD = build
DIST = dist
INLINED = $(DIST)/inlined
TESTS = tests
TESTS_SRC = $(wildcard ./$(TESTS)/[0123456789]*.test.ts)
TESTS_BUILT = $(patsubst ./$(TESTS)/%.ts,./$(BUILD)/%.js,$(TESTS_SRC))
TESTS_COVERAGE = ./coverage

EM_VERSION = 3.1.44
EM_OPTS = --rm -w /$(SRC) -v $$PWD:/$(SRC) emscripten/emsdk:$(EM_VERSION)
EM_DOCKER = docker run -u $(shell id -u):$(shell id -g) $(EM_OPTS)
EM_PODMAN = podman run $(EM_OPTS)
EM_ENGINE = $(EM_DOCKER)

# See https://emscripten.org/docs/tools_reference/emcc.html
EMCC = $(EM_ENGINE) emcc
EMMAKE = $(EM_ENGINE) emmake
EMCONFIG = $(EM_ENGINE) emconfigure

ZBAR_DEPS = $(ZBAR_SRC)/make.done
ZBAR_OBJS = $(ZBAR_SRC)/zbar/*.o $(ZBAR_SRC)/zbar/*/*.o
ZBAR_INC = -I $(ZBAR_SRC)/include/ -I $(ZBAR_SRC)/

# See https://github.com/emscripten-core/emscripten/blob/main/src/settings.js
EMCC_FLAGS = -Oz -Wall -Werror -s ALLOW_MEMORY_GROWTH=1 \
	-s EXPORTED_FUNCTIONS="['_malloc','_free']" \
	-s MODULARIZE=1 -s EXPORT_NAME=zbarWasm

LOADERS = $(BUILD)/zbar.js $(BUILD)/zbar.mjs $(BUILD)/zbar-inlined.js $(BUILD)/zbar-inlined.mjs

BUNDLES = $(DIST)/main.mjs $(DIST)/main.cjs $(DIST)/index.js $(DIST)/index.mjs \
	$(INLINED)/main.mjs $(INLINED)/main.cjs $(INLINED)/index.js $(INLINED)/index.mjs

TSC = npx tsc
TSC_FLAGS = -p ./tsconfig.test.json

ROLLUP = npx rollup
ROLLUP_FLAGS = -c

.PHONY: all dist test clean-build clean

all: dist test

test: dist $(TESTS_BUILT)
	node --experimental-vm-modules node_modules/jest/bin/jest.js --config ./jest.config.cjs --runInBand --coverage

dist: $(BUNDLES) $(DIST)/zbar.wasm

clean-build:
	-rm -rf $(DIST) $(BUILD) undecaf-zbar-wasm-*.tgz $(TESTS)/node_modules $(TESTS)/build $(TESTS)/package-lock.json

clean: clean-build
	-rm $(ZBAR_SRC).tar.gz
	-rm -rf $(ZBAR_SRC) $(TESTS_COVERAGE)

$(TESTS_BUILT): $(TESTS)/* $(BUNDLES) tsconfig.test.json jest.config.cjs .testcaferc.json
	$(TSC) $(TSC_FLAGS)

$(BUNDLES): $(LOADERS) $(DIST)/zbar.wasm $(SRC)/*.ts tsconfig.json rollup.config.js package.json
	mkdir -p $(DIST)/
	$(ROLLUP) $(ROLLUP_FLAGS)
	npm pack

$(DIST)/zbar.wasm: $(BUILD)/zbar.wasm
	mkdir -p $(DIST)/
	cp $(BUILD)/zbar.wasm $(DIST)/

$(BUILD)/zbar.wasm $(LOADERS): $(ZBAR_DEPS) $(SRC)/module.c $(BUILD)/symbol.test.o
	$(EMCC) $(EMCC_FLAGS) -o $(BUILD)/zbar.js $(SRC)/module.c $(ZBAR_INC) $(ZBAR_OBJS)
	$(EMCC) $(EMCC_FLAGS) -o $(BUILD)/zbar.mjs -sEXPORT_ES6 $(SRC)/module.c $(ZBAR_INC) $(ZBAR_OBJS)
	$(EMCC) $(EMCC_FLAGS) -o $(BUILD)/zbar-inlined.js -sSINGLE_FILE $(SRC)/module.c $(ZBAR_INC) $(ZBAR_OBJS)
	$(EMCC) $(EMCC_FLAGS) -o $(BUILD)/zbar-inlined.mjs -sEXPORT_ES6 -sSINGLE_FILE $(SRC)/module.c $(ZBAR_INC) $(ZBAR_OBJS)

$(BUILD)/symbol.test.o: $(ZBAR_DEPS) $(TESTS)/symbol.test.c
	mkdir -p $(BUILD)/
	$(EMCC) -Wall -Werror -g2 -c $(TESTS)/symbol.test.c -o $@ $(ZBAR_INC)

$(ZBAR_DEPS): $(ZBAR_SRC)/Makefile
	cd $(ZBAR_SRC) && $(EMMAKE) make CFLAGS=-Os CXXFLAGS=-Os \
		DEFS="-DZNO_MESSAGES -DHAVE_CONFIG_H"
	touch -m $(ZBAR_DEPS)

$(ZBAR_SRC)/Makefile: $(ZBAR_SRC)/configure
	cd $(ZBAR_SRC) && $(EMCONFIG) ./configure --without-x --without-xshm \
		--without-xv --without-jpeg --without-libiconv-prefix \
		--without-imagemagick --without-npapi --without-gtk \
		--without-python --without-qt --without-xshm --disable-video \
		--disable-pthread --disable-assert

$(ZBAR_SRC)/configure: $(ZBAR_SRC).tar.gz
	tar zxvf $(ZBAR_SRC).tar.gz
	touch -m $(ZBAR_SRC)/configure

$(ZBAR_SRC).tar.gz:
	curl -L -o $(ZBAR_SRC).tar.gz https://linuxtv.org/downloads/zbar/zbar-$(ZBAR_VERSION).tar.gz
