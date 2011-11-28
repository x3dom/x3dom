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
try:
    import argparse
except:
    print "\nYou need to install argparse. Please run the following command:"
    print "on your command line and try again:\n"
    print "    easy_install argparse\n"
    exit()

import os
import subprocess
import shutil

from tools import x3dom_packer
from tools.packages import FULL_PROFILE, CORE_PROFILE, COMPONENTS, prefix_path


PROJECT_ROOT = os.path.dirname(__file__)
SRC_ROOT = os.path.join(PROJECT_ROOT, 'src')
DIST_ROOT = os.path.join(PROJECT_ROOT, 'dist')
DOC_ROOT = os.path.join(PROJECT_ROOT, 'doc', 'guide')

# make sure we run from project root
os.chdir(PROJECT_ROOT)


def build():
    print("-- [ BUILD STARTED ] --------------------------------------")
    packer = x3dom_packer.packer()
    packer.build(prefix_path(FULL_PROFILE, SRC_ROOT), "dist/x3dom.min.js", "jsmin")
    packer.build(prefix_path(CORE_PROFILE, SRC_ROOT), "dist/x3dom-core.min.js", "jsmin")
    packer.build(prefix_path(COMPONENTS, SRC_ROOT), "dist/x3dom-components.min.js", "jsmin")
    print("-- [ BUILD FINISHED ] -------------------------------------")


def runserver():
    import SimpleHTTPServer
    import SocketServer

    print("Starting development server...")
    print("Open your browser and visit http://localhost:8080/")
    print("Press Ctrl-C to quit.")

    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(("", 8080), Handler)
    httpd.serve_forever()


def deploy():
    # TODO use fabric for that
    print("Updating x3dom.org... (requires you set up public key auth and a ssh config file)")
    subprocess.call(['ssh', 'x3dom', "cd ~/web/x3dom/; git pull; cd src; make; cd ..; make docs; make guide"])

def update_tests():
    # TODO, integrate the python script here instead of calling it
    print("Refreshing test cases header files.")
    subprocess.call(["python", 'tools/update_headers.py', 'test/functional'])
    subprocess.call(["python", 'tools/update_headers.py', 'test/regression'])

def stats():
    # TODO: use a python lib to do this
    print("Statistics for X3DOM")
    all_files = ' '.join(prefix_path(FULL_PROFILE, 'src'));
    subprocess.call("wc -l " + all_files, shell=True)

def changelog():
    # TODO dont' call this use it 
    print("Generating changelog this may take a while ...")
    subprocess.call(["python", 'tools/git2cl.py'])

def docs():
    # TODO: call this directly with python
    print("Generating Sphinx documentation ...")
    
    SPHINX_BUILD_DIR = os.path.join(DIST_ROOT, 'docs', 'html')
    subprocess.call(['sphinx-build', '-b', 'html', '-d' , SPHINX_BUILD_DIR + '/doctrees', '-D latex_paper_size=a4', DOC_ROOT, SPHINX_BUILD_DIR])
    
    print("Building SINGLEHTML guide....")

    SPHINX_BUILD_DIR = os.path.join(DIST_ROOT, 'docs', 'singlehtml')
    subprocess.call(['sphinx-build', '-b', 'singlehtml', '-d' , SPHINX_BUILD_DIR + '/doctrees', '-D latex_paper_size=a4', DOC_ROOT, SPHINX_BUILD_DIR])

    print("Done.")

def clean():
    # Make smarter (list of paths and files to remove, including
    # globbing patterns)
    print("Cleaning up...")
    if os.path.exists(DIST_ROOT):
        shutil.rmtree(DIST_ROOT)
    if os.path.exists("version.js"):
        os.remove("version.js")
    if os.path.exists("src/version.js"):
        os.remove("src/version.js")
        

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Management script for X3DOM. Building, running things, cleaning up, testing, and then some.')

    parser.add_argument('--build', action='store_true', default=False,  help='build the X3DOM distributables')

    parser.add_argument('--runserver', action='store_true', default=False,  help='run the development server')
    parser.add_argument('--deploy', action='store_true', default=False,  help='deploy X3DOM to the webserver')
    
    parser.add_argument('--updatetests', action='store_true', default=False,  help='update the test files in test/ with new header information')
    parser.add_argument('--stats', action='store_true', default=False,  help='show code metrics')

    parser.add_argument('--changelog', action='store_true', default=False,  help='regenerate ChangeLog file from git log messages')

    parser.add_argument('--docs', action='store_true', default=False,  help='build documentation')

    parser.add_argument('--clean', action='store_true', default=False,  help='clean up build and remove all generated files')

    args = parser.parse_args()
    
    # this is better  be done the smart way with a simple tuple and dynamic
    # method calling. Or better yet a dict with help messages and 
    # parameter names and then building  parser stuff dynamically as well
    if args.build:
        build()
    if args.runserver:
        runserver()
    elif args.deploy:
        deploy()
    elif args.updatetests:
        update_tests()
    elif args.stats:
        stats()
    elif args.clean:
        clean()
    elif args.changelog:
        changelog()
    elif args.docs:
        docs()
    else:
        parser.print_help()
            
