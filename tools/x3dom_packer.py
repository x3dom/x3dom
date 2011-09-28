#!/usr/bin/python

import os
import sys
import jsmin
import re
from subprocess import Popen, PIPE

from optparse import OptionParser
from StringIO import StringIO
from jspacker import JavaScriptPacker

VERSION_TEMPLATE = """
x3dom.versionInfo = {
    version:  '%s',
    revision: '%s',
    date:     '%s'
};
"""

usage = \
"""
  %prog [options] <files> """
  
version_string = "/** X3DOM Runtime, http://www.x3dom.org */"

tools_path = os.path.abspath(__file__)
tools_path = os.path.dirname(tools_path)
os.chdir(os.path.abspath(tools_path + "/.."))

class packer():

  # Create the version.js and fill in the git revision
  def generate_version_file(self, version_in):
    
    version_out = "src/version.js"
    
    print "Using Version: '" + version_in + "' >> '" + version_out + "'"
    
    # Read the base-version from the VERSION file
    if os.path.isfile(version_in):
      version_file = open(version_in, "r")
      
      # Make sure to only use the version string without '\n' etc. 
      version = version_file.read()
      version = version.split()[0]
      version_file.close()
      
    else:
      print "FATAL: Cannot find VERSION file: " + version_in
      sys.exit(0)
    
    # Extract the git revision 
    try:
      git_revision = Popen(["git", "log", "-1", "--pretty=format:%H"], stdout=PIPE).communicate()[0]
      git_date = Popen(["git", "log", "-1", "--pretty=format:%ad"], stdout=PIPE).communicate()[0]
    except:
      git_revision = 0
      git_date = 0
    
    print "  Version  '", version, "'"
    print "  Revision '", git_revision, "'"
    print "  Date     '", git_date, "'"
    
    # Write the version and revision to file
    version_js_file = open(version_out, "w")
    version_js_file.write(VERSION_TEMPLATE % (version, git_revision, git_date))
    version_js_file.close()
    
    version_string = "/** X3DOM Runtime, http://www.x3dom.org/ %s - %s - %s */" % (version, git_revision, git_date)
    
    return version_out
  
  # Packaging
  def build(self, input_files, output_file, packaging_module):

    # find the VERSION file
    if os.path.isfile("src/VERSION"):
      version_file_name = "src/VERSION"
    else:
      print "FATAL: Cannot find any VERSION file"
      sys.exit(0)
    
    # parse file & generate version.js
    version_out = self.generate_version_file(version_file_name);
    
    # Add the version.js to the list of input files
    input_files.append(version_out)

    concatenated_file = ""
    in_len = 0
    out_len = 0
    
    for filename in input_files:
      try:
        f = open(filename, 'r')
        concatenated_file += f.read()
        f.close()
      except:
        print "Could not open input file '%s'. Skipping" % filename    
      concatenated_file += "\n"
     
    outpath = os.path.dirname(os.path.abspath(output_file))
    
    if not os.access(outpath, os.F_OK):
      print "Create Dir: ", outpath
      os.mkdir(outpath)
    
    # Packaging
    print "Using packer: '" + packaging_module + "'"
    
    # JSMIN
    if packaging_module == "jsmin":
      # Minifiy the concatenated files
      out_stream = StringIO()  
      jsm = jsmin.JavascriptMinify()
      jsm.minify(StringIO(concatenated_file), out_stream)   
                      
      out_len = len(out_stream.getvalue())
      
      # Write the minified output file
      outfile = open(output_file, 'w')
      outfile.write(version_string)
      outfile.write(out_stream.getvalue())
      outfile.close()
    
    # JSPACKER
    elif packaging_module == "jspacker":
      p = JavaScriptPacker()
      
      result = p.pack(concatenated_file, compaction=True, encoding=62, fastDecode=False)
      out_len = len(result)
      outfile = open(output_file, 'w')
      outfile.write(result)
      outfile.close()
    
    # ClosureCompiler
    elif packaging_module == "closure":
    
      # collect files
      files = []
      for filename in input_files:
        files += ["--js=" + filename]
        
      Popen(["java", "-jar", "tools/compiler.jar", "--js_output_file=" + output_file, "--summary_detail_level=3", "--warning_level=VERBOSE"] + files)
      #Popen(["java", "-jar", "tools/compiler.jar", "--js_output_file=" + output_file] + files)
    
    # NONE
    elif packaging_module == None:
      outfile = open(output_file, 'w')
      outfile.write(version_string)
      outfile.write(concatenated_file)
      outfile.close()

    # Output some stats
    in_len = len(concatenated_file)    
    ratio = float(out_len) / float(in_len);
    print "  packed: %s to %s, ratio is %s" % (in_len, out_len, ratio)

if __name__ == '__main__':
    parser = OptionParser(usage)
    
    parser.add_option("-a", "--algo",       type="string",  dest="algo",      help='The algorithm to use. [jsmin, jspacker, closure]',    default="jsmin")
    parser.add_option("-o", "--outfile",    type="string",  dest="outfile",   help='The name of the output file.')
    
    (options, input_files) = parser.parse_args()
    
    if len(input_files) == 0:
      print parser.print_help()
      print "- No input files specified. Exiting -"
      sys.exit(0)
    
    if not options.outfile:
      print parser.print_help()
      print "- Please specify an output file using the -o options. Exiting. -"
      sys.exit(0)
    
    x3dom_packer = packer()
    x3dom_packer.build(input_files, options.outfile, options.algo)
