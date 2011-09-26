V ?= 0

SRC_DIR = src
TEST_DIR = test
TOOL_DIR = tools
DOC_DIR = doc

PREFIX = .
DIST_DIR = ${PREFIX}/dist

JS_ENGINE ?= `which node`

# Self contained Node.js binaries for Windows can be found here http://node-js.prcn.co.cc/
#JS_ENGINE ='dist/node/bin/node.exe'

COMPILER = ${JS_ENGINE} ${TOOL_DIR}/uglify.js --unsafe

# order is important
BASE_FILES = \
	${SRC_DIR}/lang/Array.js\
	${SRC_DIR}/Internals.js\
    ${SRC_DIR}/debug.js\
    ${SRC_DIR}/ImageLoadManager.js\
	${SRC_DIR}/lang/Properties.js\
    ${SRC_DIR}/X3DCanvas.js\
    ${SRC_DIR}/Runtime.js\
    ${SRC_DIR}/Main.js\
	${SRC_DIR}/version.js\
	${SRC_DIR}/gfx_webgl.js\
	${SRC_DIR}/gfx_flash.js\
    ${SRC_DIR}/Mesh.js\
	${SRC_DIR}/X3DDocument.js\
	${SRC_DIR}/MatrixMixer.js\
	${SRC_DIR}/Viewarea.js\
	${SRC_DIR}/fields.js\
	${SRC_DIR}/nodes/NodeNameSpace.js\
	${SRC_DIR}/nodes/Core.js\
	${SRC_DIR}/nodes/Grouping.js\
	${SRC_DIR}/nodes/Bindable.js\
    ${SRC_DIR}/nodes/Rendering.js\
    ${SRC_DIR}/nodes/Shape.js\
	${SRC_DIR}/nodes/Lighting.js\
	${SRC_DIR}/nodes/Interpolation.js\
	${SRC_DIR}/nodes/Followers.js\
	${SRC_DIR}/nodes/Time.js\
	${SRC_DIR}/nodes/Networking.js\
	${SRC_DIR}/nodes/EnvironmentalEffects.js\
	${SRC_DIR}/nodes/Navigation.js\
	${SRC_DIR}/nodes/Text.js\
	${SRC_DIR}/nodes/Sound.js\
	${SRC_DIR}/nodes/Texturing.js\
    ${SRC_DIR}/nodes/Shaders.js\
    ${SRC_DIR}/nodes/Geometry3D.js\
    ${SRC_DIR}/nodes/Geospatial.js\

COMPONENTS = \
    ${SRC_DIR}/nodes/Geometry2D.js\
    ${SRC_DIR}/nodes/VolumeRendering.js

MODULES = ${BASE_FILES}

FULL = ${MODULES}\
    ${COMPONENTS}


X3DOM = ${DIST_DIR}/x3dom.js
X3DOM_MIN = ${DIST_DIR}/x3dom.min.js

QUNIT_DIR = ${TEST_DIR}/qunit

X3DOM_VER = $(shell cat src/VERSION)
VER = sed "s/@VERSION/${X3DOM_VER}/"

DATE=$(shell git log -1 --pretty=format:%ad)

all: x3dom min lint
	@@echo "X3DOM build complete.

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}


ifeq ($(strip $(V)),0)
verbose = --quiet
else ifeq ($(strip $(V)),1)
verbose =
else
verbose = --verbose
endif

define clone_or_pull
-@@if test ! -d $(strip ${1})/.git; then \
		echo "Cloning $(strip ${1})..."; \
		git clone $(strip ${verbose}) --depth=1 $(strip ${2}) $(strip ${1}); \
	else \
		echo "Pulling $(strip ${1})..."; \
		git --git-dir=$(strip ${1})/.git pull $(strip ${verbose}) origin master; \
	fi
endef


${QUNIT_DIR}:
	$(call clone_or_pull, ${QUNIT_DIR}, git://github.com/jquery/qunit.git)

init: ${QUNIT_DIR}
x3dom: init ${X3DOM}
release: x3dom changelog


${X3DOM}: ${FULL} | ${DIST_DIR}
	@@echo "Building" ${X3DOM}
	@@cat ${FULL} | \
	sed 's/@DATE/'"${DATE}"'/' | \
	${VER} > ${X3DOM};

lint: x3dom
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Checking X3DOM against JSLint..."; \
		${JS_ENGINE} ${TOOL_DIR}/jslint-check.js; \
	else \
		echo "You must have NodeJS installed in order to test X3DOM against JSLint."; \
	fi

min: ${X3DOM_MIN}

${X3DOM_MIN}: x3dom
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying X3DOM" ${X3DOM_MIN}; \
		${COMPILER} ${X3DOM} > ${X3DOM_MIN}.tmp; \
		sed '$ s#^\( \*/\)\(.\+\)#\1\n\2;#' ${X3DOM_MIN}.tmp > ${X3DOM_MIN}; \
		rm -rf ${X3DOM_MIN}.tmp; \
	else \
		echo "You must have NodeJS installed in order to minify X3DOM."; \
	fi

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}

	@@echo "Removing cloned directories"
	@@rm -rf test/qunit

	@@echo "Removing generated API documentation"
	@@rm -rf ${DOC_DIR}/api
    
	@@echo "Removing backup files"
	@@rm -rf ${TEST_DIR}/functional/*html~backup~*
	@@rm -rf ${TEST_DIR}/regression/*html~backup~*

runserver:
	@@echo "Running development server..."
	@@echo "Open your browser and visit http://localhost:8080/"
	@@echo "Press Ctrl-C to quit."
	python -m SimpleHTTPServer 8080

changelog:
	@@echo "Generating changelog this may take a while ..."
	@python ${TOOL_DIR}/git2cl.py
#@svn log --verbose --xml https://x3dom.svn.sourceforge.net/svnroot/x3dom/trunk | xsltproc --nowrite --nomkdir --nonet tools/svn2cl.xsl - > ChangeLog

docs: ${DIST_DIR} guide

guide:
	@echo "Building HTML guide...."
	cd doc/guide; make html; cd ../..

	@echo "Building SINGLEHTML guide...."
	cd doc/guide; make singlehtml; cd ../..

# @echo "Building PDF guide...."
# cd doc/guide; make latexpdf; cd ../..

deploy:
	@@echo "Updating x3dom.org... (requires you set up public key auth and a ssh config file)"
	ssh x3dom "cd ~/web/x3dom/; git pull; cd src; make; cd ..; make docs; make guide"

refreshtests:
	@@echo "Refreshing test cases header files."
	python tools/update_headers.py test/functional
	python tools/update_headers.py test/regression

stats:
	@@echo "Statistics for X3DOM"
	wc -l $(BASE_FILES)

.PHONY: all x3dom lint min init changelog runserver docs refreshtests deploy stats guide