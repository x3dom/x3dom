# -*- coding: utf-8 -*-
# find and replace in a dir by multiple pairs of regex

import os, sys,shutil,re

from packages import FULL_PROFILE, prefix_path

FULL_PROFILE = prefix_path(FULL_PROFILE, '../../src')

mydir = sys.argv[1]

x3dom_includes = '''
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<link rel="stylesheet" type="text/css" href="../../src/x3dom.css" />\n'''

for include in FULL_PROFILE:
    x3dom_includes += '<script type="text/javascript" src="' + include + '"></script>\n'

findreplace = [
	(re.compile(
		ur'<!-- BEGIN:X3DOM -->.*<!-- END:X3DOM -->',re.U|re.M|re.DOTALL), 
		ur'<!-- BEGIN:X3DOM -->' + x3dom_includes + '<!-- END:X3DOM -->'
	),
]


def replaceStringInFile(filePath):
   "replaces all string by a regex substitution"
   backupName=filePath+'~backup~'

   print 'reading:', filePath
   input = open(filePath,'rb')
   s=unicode(input.read(),'utf-8')
   input.close()

   numRep=None
   for couple in findreplace:
      if numRep == None:
         numRep = re.search(couple[0],s)
      outtext = re.sub(couple[0],couple[1], s)
      s=outtext

   if numRep:
      print ' writing:', filePath
      shutil.copy2(filePath, backupName)
      outF = open(filePath,'r+b')
      outF.read() # we do this way to preserve file creation date
      outF.seek(0)
      outF.write(outtext.encode('utf-8'))
      outF.truncate()
      outF.close()

def myfun(dummy, curdir, filess):
   for child in filess:
      if re.search(r'.*\.html|xhtml$',child,re.U) and os.path.isfile(curdir+'/'+child):
         replaceStringInFile(curdir+'/'+child)

os.path.walk(mydir, myfun, 3)
