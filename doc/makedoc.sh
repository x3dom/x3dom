#!/bin/bash
JSDOCDIR="/home/peter/downloads/jsdoc_toolkit-2.3.2/jsdoc-toolkit"
JSDOCDIR="/home/peter/Dokumente/jsdoc_toolkit-2.3.2/jsdoc-toolkit"
CURDIR=`pwd`
pushd .
cd $JSDOCDIR
java -jar jsrun.jar app/run.js -a -t=templates/jsdoc -r 2 $CURDIR/../src -d=$CURDIR
popd