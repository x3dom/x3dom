#!/usr/bin/env python
# -------------------------------------------------------------------
# NOTE:
# What is written here is what this build file should do, not what it
# is currently doing ;) So, when working on the build system use this
# text as guide of what to do.
# -------------------------------------------------------------------
# 
# This buildfile creates the distributable package of X3DOM
# and zips it up as tarball and zip variants. It also provides additiona
# management tasks for development and debugging.
#
#
# BUILD PROCESS
# =============
#
# First all required files are assembled in the dist/ directory of the X3DOM
# checkout (aka build directory - maybe rename it).
# 
# dist/
#   README                the readme
#   LICENSE               the license for X3DOM
#   components/           optional components to be used with core profile
#       Geometry2D.js
#       ...
#   docs/
#       nodetypes-x.x.x.html  The node type tree dump
#   docs/html/            The documentation as browsable html
#   docs/singlehtml/      The documentation as single page html
#   docs/guide.pdf        The documnetation as PDF (optinal)
#   examples/             Some selected examples that work locally
#   x3dom.js              the core x3dom profile, minified
#   x3dom-debug.js        the core x3dom profile, un-minified with comments
#   x3dom-full.js         the full x3dom profile, minified
#   x3dom-full.debug.js   the full x3dom profile, un-minified with comments
#
# The unminified versions are for local development and debugging. This is 
# what people should use locally when they develop their app with X3DOM.
#
# RELEASE
# =======
# Once the files are assembled as outlined above, they are zipped and 
# targzed to:
#
#   x3dom-x.x.x.tar.gz
#   x3dom-x.x.x.zip
#
# Once this is done, the Git repository is tagged with the release version 
# x.x.x. Then the files should be uploaded to the webserver (this is also 
# accomplised by this file). We want to provide the tarball|zip in the 
# download directory, but also the unzipped version. 
# The structure should look like this:

#   x3dom.org/download/
#      dev/              -> development build x3dom/dist/
#      latest/           -> symlink@x3dom-y.y.y/
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
# with the unzipped ones as well as a symlink "latest" pointing to the 
# latest stable version
# 
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
#os.chdir(PROJECT_ROOT)


def build(mode='production'):
    print("\n-- [ BUILD STARTED ] --------------------------------------")

    packer = x3dom_packer.packer()
    
    # building compressed files
    packer.build(prefix_path(FULL_PROFILE, SRC_ROOT), "dist/x3dom-full.js", "jsmin")
    packer.build(prefix_path(CORE_PROFILE, SRC_ROOT), "dist/x3dom.js", "jsmin")
        
    if mode == 'debug':
        # building plain files (debug)
        packer.build(prefix_path(FULL_PROFILE, SRC_ROOT), "dist/x3dom-full.debug.js", 'none')
        packer.build(prefix_path(CORE_PROFILE, SRC_ROOT), "dist/x3dom.debug.js", 'none')

    # ~~~~ copy copy components extras ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    print("\nBundling components...")
    nodes_dest = os.path.join(DIST_ROOT, 'components')

    if not os.path.exists(nodes_dest):
        os.makedirs(nodes_dest)
        
    for src in prefix_path(COMPONENTS, SRC_ROOT):
        try:
            print "  Copying file %s to %s" % (src, nodes_dest)
            packer.build([src], os.path.join(nodes_dest, os.path.basename(src)), 'jsmin', include_version=False)
#            shutil.copy(src, nodes_dest)
        except:
            print "  Error copying file %s" % src
    # done with components
    
    # ~~ copy other files ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    print("\nCopying additional files")
    shutil.copy('README.md', DIST_ROOT)
    shutil.copy('LICENSE', DIST_ROOT)
    shutil.copy('CHANGELOG', DIST_ROOT)
    shutil.copy('AUTHORS', DIST_ROOT)
    shutil.copy(SRC_ROOT + '/x3dom.css', DIST_ROOT)
    shutil.copy(SRC_ROOT + '/flashbackend/bin/x3dom.swf', DIST_ROOT)
    # end other files

def _build_examples():
    ## copy the exmaples to the distribution as well
    # as x3dom.css, js, etc.
    pass

def release(version):
    # does everything necessary to bundle a major release
    # like git tagging, bundling tar/gz, deploying, etc.
    # adding version numbers to files, etc.
    pass


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
    subprocess.call('ssh x3dom "cd ~/web/x3dom/; git pull; python manage.py --rebuild; ln -s dist/x3dom.js src/x3dom.js"', shell=True)

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



def _clone_or_pull():
    # Gets Qunit
    pass
    # define clone_or_pull
    # -@@if test ! -d $(strip ${1})/.git; then \
    #       echo "Cloning $(strip ${1})..."; \
    #       git clone $(strip ${verbose}) --depth=1 $(strip ${2}) $(strip ${1}); \
    #   else \
    #       echo "Pulling $(strip ${1})..."; \
    #       git --git-dir=$(strip ${1})/.git pull $(strip ${verbose}) origin master; \
    #   fi
    # endef
    # 
    # 
    # ${QUNIT_DIR}:
    #   $(call clone_or_pull, ${QUNIT_DIR}, git://github.com/jquery/qunit.git)
    

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

    parser.add_argument('--build',  nargs='?', action='store', default=False, const='production', required=False,  choices= ['production', 'debug', 'source'],help='build the X3DOM distributables. The default is to build production libraries (minified). If you use the debug switch, you can produce plain versions, with the source switch the source could distributable will be generated')
    
    parser.add_argument('--release', action='store', help='make a release, version number RELEASE in the format x.x.x (major.minor.tiny)')

    parser.add_argument('--runserver', action='store_true', default=False,  help='run the development server')
    
    parser.add_argument('--deploy', action='store_true', default=False,  help='deploy X3DOM to the webserver')
    
    parser.add_argument('--updatetests', action='store_true', default=False,  help='update the test files in test/ with new header information')
    parser.add_argument('--stats', action='store_true', default=False,  help='show code metrics')

    parser.add_argument('--changelog', action='store_true', default=False,  help='regenerate ChangeLog file from git log messages')

    parser.add_argument('--docs', action='store_true', default=False,  help='build documentation')

    parser.add_argument('--clean', action='store_true', default=False,  
help='clean up build and remove all generated files')

    parser.add_argument('--rebuild', action='store_true', default=False,  help='clean up and build everything again')

    

    args = parser.parse_args()
    # print args
    # exit()
    
    # this is better  be done the smart way with a simple tuple and dynamic
    # method calling. Or better yet a dict with help messages and 
    # parameter names and then building  parser stuff dynamically as well
    if args.build:
        build(mode=args.build)
    elif args.release:
        release()
    elif args.runserver:
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
    elif args.rebuild:
        clean()
        build()
        docs()
    else:
        parser.print_help()
            
