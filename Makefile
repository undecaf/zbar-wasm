ZBAR_VERSION = 0.23.90
ZBAR_SRC = zbar-$(ZBAR_VERSION)

SRC = src
BUILD = build
DIST = dist
TEST = test
TEST_TS = $(wildcard ./$(TEST)/*.ts)
TEST_JS = $(patsubst ./$(TEST)/%.ts,./$(BUILD)/%.js,$(TEST_TS))
TEST_COVERAGE = ./coverage

EM_VERSION = 3.1.0
EM_OPTS = --rm -w /$(SRC) -v $$PWD:/$(SRC) emscripten/emsdk:$(EM_VERSION)
EM_DOCKER = docker run -u $(shell id -u):$(shell id -g) $(EM_OPTS)
EM_PODMAN = podman run $(EM_OPTS)
EM_ENGINE = $(EM_DOCKER)
EMCC = $(EM_ENGINE) emcc
EMMAKE = $(EM_ENGINE) emmake
EMCONFIG = $(EM_ENGINE) emconfigure

ZBAR_DEPS = $(ZBAR_SRC)/make.done
ZBAR_OBJS = $(ZBAR_SRC)/zbar/*.o $(ZBAR_SRC)/zbar/*/*.o
ZBAR_INC = -I $(ZBAR_SRC)/include/ -I $(ZBAR_SRC)/
EMCC_FLAGS = -Oz -Wall -Werror -s ALLOW_MEMORY_GROWTH=1 \
	-s EXPORTED_FUNCTIONS="['_malloc','_free']" \
	-s MODULARIZE=1 -s EXPORT_NAME=zbarWasm

BUNDLES = $(DIST)/main.js $(DIST)/main.cjs $(DIST)/index.js

TSC = npx tsc
TSC_FLAGS = -p ./tsconfig.test.json

ROLLUP = npx rollup
ROLLUP_FLAGS = -c

.PHONY: all dist test clean-build clean

all: dist test

test: dist $(TEST_JS)
	jest --config ./jest.config.cjs --coverage

dist: $(BUNDLES) $(DIST)/zbar.wasm

clean-build:
	-rm -rf $(DIST) $(BUILD)

clean: clean-build
	-rm $(ZBAR_SRC).tar.gz
	-rm -rf $(ZBAR_SRC) $(TEST_COVERAGE)

$(TEST_JS): $(TEST_TS) $(BUNDLES) tsconfig.json tsconfig.test.json
	$(TSC) $(TSC_FLAGS)

$(BUNDLES): $(BUILD)/zbar.js $(BUILD)/zbar.mjs $(SRC)/*.ts tsconfig.json rollup.config.js package.json
	$(ROLLUP) $(ROLLUP_FLAGS)

$(DIST)/zbar.wasm: $(BUILD)/zbar.wasm
	mkdir -p $(DIST)/
	cp $(BUILD)/zbar.wasm $(DIST)/

$(BUILD)/zbar.wasm $(BUILD)/zbar.js $(BUILD)/zbar.mjs: $(ZBAR_DEPS) $(SRC)/module.c $(BUILD)/symbol.test.o
	$(EMCC) $(EMCC_FLAGS) -o $(BUILD)/zbar.js $(SRC)/module.c $(ZBAR_INC) $(ZBAR_OBJS)
	$(EMCC) $(EMCC_FLAGS) -o $(BUILD)/zbar.mjs $(SRC)/module.c $(ZBAR_INC) $(ZBAR_OBJS)

$(BUILD)/symbol.test.o: $(ZBAR_DEPS) $(TEST)/symbol.test.c
	mkdir -p $(BUILD)/
	$(EMCC) -Wall -Werror -g2 -c $(TEST)/symbol.test.c -o $@ $(ZBAR_INC)

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
