#!/usr/bin/env python
# coding=utf-8
from __future__ import with_statement
# -------------------------------------------------------------------
# NOTE:
# What is written here is what this build file should do, not what it
# is currently doing ;) So, when working on the build system use this
# text as guide of what to do.
# -------------------------------------------------------------------
# 
# This buildfile creates the distributable package of X3DOM
# and zips it up as tarball and zip variants. It also provides additional
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
#   docs/guide.pdf        The documnetation as PDF (optional)
#   examples/             Some selected examples that work locally
#   x3dom.js              the core x3dom profile, minified
#   x3dom-debug.js        the core x3dom profile, un-minified with comments
#   x3dom-full.js         the full x3dom profile, minified
#   x3dom-full.debug.js   the full x3dom profile, un-minified with comments
#   ...
#
# The concatenated versions are for local development and debugging. This is
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
# x.x.x. Then the files should be uploaded to the webserver (this is should
# also b accomplished by this file). We want to provide the tarball|zip in the
# download directory, but also the unzipped version. 
# The structure should look like this:

#   x3dom.org/download/
#      dev/              -> development build x3dom/dist/
#      x.x.x/
#        <unzipped contents>
#        x3dom-x.x.x.zip
#
#      y.y.y/
#        <unzipped contents>
#        x3dom-y.y.y.zip
#
#
# -----
try:
    import argparse
except:
    print("\nYou need to install argparse. Please run the following command:")
    print("on your command line and try again:\n")
    print("    easy_install argparse\n")
    exit()

import os
import subprocess
import shutil
from contextlib import closing
from zipfile import ZipFile, ZIP_DEFLATED

from tools import x3dom_packer
from tools.packages import FULL_PHYS_PROFILE, FULL_PROFILE, CORE_PROFILE, EXTENSIONS, COMPRESSED_EXT_LIBS, prefix_path


PROJECT_ROOT = os.path.dirname(__file__)
SRC_ROOT = os.path.join(PROJECT_ROOT, 'src')
LIB_ROOT = os.path.join(PROJECT_ROOT, 'lib')
DIST_ROOT = os.path.join(PROJECT_ROOT, 'dist')
DOC_ROOT = os.path.join(PROJECT_ROOT, 'doc')
GUIDE_ROOT = os.path.join(DOC_ROOT, 'guide')

# make sure we run from project root
#os.chdir(PROJECT_ROOT)


def build(mode='production'):
    prepare()
    print("\n-- [ BUILD STARTED ] --------------------------------------")

    packer = x3dom_packer.packer()
    
    # building compressed files
    packer.build(CORE_PROFILE, "dist/x3dom.js", "jsmin", include_version=True, src_prefix_path=SRC_ROOT)
    packer.build(FULL_PROFILE, "dist/x3dom-full.js", "jsmin", include_version=True, src_prefix_path=SRC_ROOT)
    packer.build(FULL_PHYS_PROFILE, "dist/x3dom-full-physics.js", "jsmin", include_version=True, src_prefix_path=SRC_ROOT) 	
    # add compressed external libraries to full release
    packer.build(COMPRESSED_EXT_LIBS + [("x3dom-full-physics.js", ["../dist/x3dom-full-physics.js"])], "dist/x3dom-full-physics.js", 'none', src_prefix_path=SRC_ROOT)
    
        
    if not mode == 'no-debug':
        # building plain files (debug)
        packer.build(FULL_PHYS_PROFILE, "dist/x3dom-full-physics.debug.js", 'none', src_prefix_path=SRC_ROOT)
        packer.build(FULL_PROFILE, "dist/x3dom-full.debug.js", 'none', src_prefix_path=SRC_ROOT)
        packer.build(CORE_PROFILE, "dist/x3dom.debug.js", 'none', src_prefix_path=SRC_ROOT)
        # add compressed external libraries to full release
        packer.build(COMPRESSED_EXT_LIBS + [("x3dom-full-physics.debug.js", ["../dist/x3dom-full-physics.debug.js"])], "dist/x3dom-full-physics.debug.js", 'none', src_prefix_path=SRC_ROOT)
    

    # ~~~~ copy copy components extras ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    print("\nBundling extensions...")
    nodes_dest = os.path.join(DIST_ROOT, 'components')

    if not os.path.exists(nodes_dest):
        os.makedirs(nodes_dest)
        
    for (component, files) in EXTENSIONS:
        packer.build([(component, files)], os.path.join(nodes_dest, os.path.basename(component + '.js')), 'jsmin', include_version=False, src_prefix_path=SRC_ROOT)

        try:
            """
            #Handle special case (folder instead of single js file):
            if not src.endswith(".js"):
                #Construct name for concatenated file:
                if src.endswith("/"):
                    filename = src[:-1]+".js"
                else:
                    filename = src+".js"
                print "  Copying files from folder %s concatenated as %s to %s" % (src, filename, nodes_dest)
            else:
                print "  Copying file %s to %s" % (src, nodes_dest)
                filename = src
            """
#            shutil.copy(src, nodes_dest)
        except:
            print("  Error copying file to %s" % component)
    # done with components

    print("\nCopying additional files")
    shutil.copy('README.md', DIST_ROOT)
    shutil.copy('LICENSE', DIST_ROOT)
    shutil.copy('RELEASENOTES.rst', DIST_ROOT)
    shutil.copy('AUTHORS', DIST_ROOT)
    shutil.copy(SRC_ROOT + '/x3dom.css', DIST_ROOT)
    shutil.copy(LIB_ROOT + '/dash.all.js', DIST_ROOT)
    shutil.copy(LIB_ROOT + '/ammo.js', DIST_ROOT)
    # end other files

def _build_examples():
    ## copy the exmaples to the distribution as well
    # as x3dom.css, js, etc.
    pass

def release(version='snapshot'):
    # does everything necessary to bundle a major release
    # like git tagging, bundling tar/gz, deploying, etc.
    # adding version numbers to files, etc.
    rebuild()
    print("Creating ZIP distributable")
    _zipdir(DIST_ROOT, 'dist/x3dom-%s.zip' % version)

def runserver():
    try:
        import http.server as SimpleHTTPServer
        import socketserver as SocketServer
    except ImportError:
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

def docs(mode='nojsdoc'):
    
    if not mode == 'nojsdoc':
        # TODO: call this directly with python
        print("Generating JSDOC for Sphinx")
        subprocess.call([
            'java', 
            '-jar',
            'tools/jsdoc-toolkit/jsrun.jar',
            'tools/jsdoc-toolkit/app/run.js',
            '--recurse=5',
            '--template=doc/guide/_themes/jsdoc-for-sphinx',
            '-x=js,jsx', 
            '--allfunctions',
            '--directory=./doc/guide/api',
            SRC_ROOT
            ])
    
    
    print("Generating Sphinx documentation ...")
    
    SPHINX_BUILD_DIR = os.path.join(DIST_ROOT, 'docs', 'html')
    subprocess.call(['sphinx-build', '-b', 'html', '-d' , SPHINX_BUILD_DIR + '/doctrees', '-D latex_paper_size=a4', GUIDE_ROOT, SPHINX_BUILD_DIR])
    
    print("Building SINGLEHTML guide....")

    SPHINX_BUILD_DIR = os.path.join(DIST_ROOT, 'docs', 'singlehtml')
    subprocess.call(['sphinx-build', '-b', 'singlehtml', '-d' , SPHINX_BUILD_DIR + '/doctrees', '-D latex_paper_size=a4', GUIDE_ROOT, SPHINX_BUILD_DIR])

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
    if os.path.exists(os.path.join(GUIDE_ROOT, 'api')):
        shutil.rmtree(os.path.join(GUIDE_ROOT, 'api'))
    if os.path.exists("version.js"):
        os.remove("version.js")
    if os.path.exists("src/version.js"):
        os.remove("src/version.js")
        

def prepare():
    print("Preparing build...")
    if not os.path.exists(DIST_ROOT):
        os.mkdir(DIST_ROOT)


def rebuild():
    clean()
    prepare()
    build()
    docs()


def _zipdir(basedir, archivename):
    assert os.path.isdir(basedir)
    with closing(ZipFile(archivename, "w", ZIP_DEFLATED)) as z:
        for root, dirs, files in os.walk(basedir):
            # ignore empty directories
            for fn in files:
                # skip self and other zip files
                if os.path.basename(fn) == os.path.basename(archivename):
                    continue
                print("Zipping %s" % fn)
                absfn = os.path.join(root, fn)
                zfn = absfn[len(basedir)+len(os.sep):] #XXX: relative path
                z.write(absfn, zfn)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Management script for X3DOM. Building, running things, cleaning up, testing, and then some.')

    parser.add_argument('--build',  nargs='?', action='store', default=False, const='production', required=False,  choices= ['production', 'debug', 'source'],help='build the X3DOM distributables. The default is to build production libraries (minified). If you use the debug switch, you can produce plain versions, with the source switch the source could distributable will be generated')
    
    parser.add_argument('--release', action='store', help='make a release, version number RELEASE in the format x.x.x (major.minor.tiny)')

    parser.add_argument('--runserver', action='store_true', default=False,  help='run the development server')
    
    parser.add_argument('--deploy', action='store_true', default=False,  help='deploy X3DOM to the webserver')
    
    parser.add_argument('--updatetests', action='store_true', default=False,  help='update the test files in test/ with new header information')
    parser.add_argument('--stats', action='store_true', default=False,  help='show code metrics')

    parser.add_argument('--changelog', action='store_true', default=False,  help='regenerate ChangeLog file from git log messages')

    parser.add_argument('--docs', nargs='?', action='store', default=False, const='nojsdoc', required=False, choices=['all', 'nojsdoc'], help='build documentation')

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
        prepare()
        build(mode=args.build)
    elif args.release:
        release(version=args.release)
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
        prepare()
        docs(mode=args.docs)
    elif args.rebuild:
        rebuild()
    else:
        parser.print_help()
            
