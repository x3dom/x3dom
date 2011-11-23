#!/usr/bin/env python
# -------------------------------------------------------------------
# NOTE:
# What is written here is what this build file should do, not what it
# is currently doing ;) So, when working on the build system use this
# text as guide of what to do.
# -------------------------------------------------------------------
# 
# This buildfile creates the distributable package of X3DOM
# and zips it up as tarball and zip variants.
#
# First all required files are assembled in the dist/ directory of the X3DOM
# checkout
# 
# dist/
#   README                the readme
#   LICENSE               the license for X3DOM
#   docs/
#       nodetypes-x.x.x.html  The node type tree dump
#   docs/html/            The documentation as browsable html
#   docs/singlehtml/      The documentation as single page html
#   docs/guide.pdf        The documnetation as PDF (optinal)
#   examples/             Some selected examples that work locally
#   x3dom-x.x.js          the full profile x3dom, un-minified
#   x3dom-x.x.min.js      the full profile x3dom, minified
#   x3dom-core-x.x.js     the core x3dom profile, un-minified
#   x3dom-core-x.x.min.js the core minified
#   x3dom-more-x.x.js     extended nodes unminified
#   x3dom-more-x.x.min.js extended nodes minified
#
# The minified versions are for production environments. Meaning this
# is what people should copy to their webservers. The unminified versions
# are for local development and debugging. This is what people should use
# locally when they develop their app with X3DOM.
#
# Once the files are assembled, they should be zipped and targzed to:
#
#   x3dom-x.x.x.tar.gz
#   x3dom-x.x.x.zip
#
# Additionally this buildfile provides management tasks currently stored in 
# the root level Makefile.
#
# Once the build completed, the files should be uploaded to the 
# webserver (this is also accomplised by this file). We want to provide the 
# tarball|zip in the release directory, but also the unzipped version. 
# The structure should look like this:

#   x3dom.org/release/
#      current/           -> symlink@x3dom-y.y.y/
#      x3dom-x.x.x/
#        <unzipped contents>
#      x3dom-y.y.y/
#        <unzipped contents>
#      x3dom-x.x.x.tar.gz
#      x3dom-x.x.x.zip
#      x3dom-y.y.y.tar.gz
#      x3dom-y.y.y.zip
#
# Basically we have the zipped versions in one directory and a directory
# with the unzipped ones as well as a symlink "current" pointing to the 
# latest release directory



# ----- 
# try:
#     import argparse
# except:
#     print "\nYou need to install argparse. Please run the following command:"
#     print "on your command line and try again:\n"
#     print "    easy_install argparse\n"
#     exit();
# 
# 
# parser = argparse.ArgumentParser(description='Build X3DOM and then some')
# parser.add_argument('test', metavar='test', nargs='+', help='Run the test')
# parser.add_argument('--targets', '-T', help='Show list of available action')
# 
# args = parser.parse_args()
# print args


from tools import x3dom_packer

#from tools.packages import full_profile
execfile("../tools/packages.py") # <-- WOOOAHH!?? ^&*%#@???  use line above, however mixes up path with x3dom_packer thing. no time to fix this yet, but needs to be done properly.

packer = x3dom_packer.packer()
packer.build(full_profile, "dist/x3dom.js", "jsmin")
